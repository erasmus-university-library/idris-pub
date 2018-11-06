from idris import main
from idris.services.course_royalties import course_royalty_calculator_factory
from core import BaseTest

class CourseRoyaltiesTest(BaseTest):
    def setUp(self):
        settings = self.app_settings()
        self.app = main({}, **settings)
        self.royalties = course_royalty_calculator_factory(
            self.app.registry, '2018')()

    def test_royalties_empty(self):
        assert self.royalties.calculate([]) == []

    def test_royalties_missing_content(self):
        out = self.royalties.calculate([{'id': 0, 'type': 'article'}])[0]
        assert out['warning'] == 'no_content'
        assert out['warning_message'] == 'Material has no link or PDF'
        assert out['tariff'] == 'unknown'

    def test_royalties_external_link(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'link': 'https://doi.org/10.1234/56'}])[0]
        assert out['tariff'] == 'none'
        assert out['tariff_message'] == 'External URL'
        assert out['cost'] == 0
        assert out.get('warning') is None

    def test_royalties_missing_words_and_pages(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0}])[0]
        assert out['warning'] == 'bad_wordcount'
        assert out['warning_message'] == 'Unknown count of words'
        assert out['tariff'] == 'unknown'
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'words': 10}])[0]
        assert out['warning'] == 'bad_wordcount'
        assert out['warning_message'] == 'Unusual low count of words'
        assert out['tariff'] == 'unknown'
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'words': 1000}])[0]
        assert out['warning'] == 'bad_pagecount'
        assert out['warning_message'] == 'Unknown count of pages'
        assert out['tariff'] == 'unknown'

    def test_royalties_short_article(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'words': 5000,
             'pages': 10}])[0]
        assert out['tariff'] == 'short'
        assert out['tariff_message'] == 'Article within 8000 word limit'
        assert out['cost'] == 0

    def test_royalties_middle_article(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'words': 15000,
             'pages': 30}])[0]
        assert out['tariff'] == 'middle'
        assert out['tariff_message'] == 'Article within 50 page limit'

    def test_royalties_oa_article(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'exception': 'openAccess',
             'words': 15000,
             'pages': 60}])[0]
        assert out['tariff'] == 'excempt'
        assert out['tariff_message'] == 'Article published in open access'
        assert out['cost'] == 0

    def test_royalties_excempt_article(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'exception': 'I am the author, and have complete ownership',
             'words': 15000,
             'pages': 60}])[0]
        assert out['tariff'] == 'excempt'
        assert out['tariff_message'] == 'Article is excempted'
        assert out['excempt_message'] == (
            'I am the author, and have complete ownership')
        assert out['cost'] == 0

    def test_royalties_long_article(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'words': 15000,
             'pages': 60}])[0]
        assert out['tariff'] == 'long'
        assert out['tariff_message'] == 'Article exceeds limits'
        assert out['cost'] == 1950
        assert out['cost_message'] == '60 pages x 0.325 cents = 19.50'
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'article',
             'blob_id': 0,
             'language': 'nl',
             'words': 15000,
             'pages': 60}])[0]
        assert out['tariff'] == 'long'
        assert out['tariff_message'] == 'Article exceeds limits'
        assert out['cost'] == 1548
        assert out['cost_message'] == '60 pages x 0.258 cents = 15.48'

    def test_royalties_chapter_missing_book_pages(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'bookChapter',
             'blob_id': 0,
             'words': 5000,
             'pages': 10}])[0]
        assert out['tariff'] == 'unknown'
        assert out['warning'] == 'no_bookpage_count'
        assert out['warning_message'] == 'Unknown book page count'

    def test_royalties_chapter_short(self):
        chapter = {'id': 0,
                   'type': 'bookChapter',
                   'blob_id': 0,
                   'book_title': 'Introduction to ABC',
                   'id': 0,
                   'words': 4000,
                   'pages': 10,
                   'book_pages': 300}
        out = self.royalties.calculate([chapter])[0]
        assert out['tariff'] == 'short'
        assert out['tariff_message'] == (
            'Chapter within 10000 word and 100 page limit')
        assert out['cost'] == 0
        # let's try this again with multiple chapters from
        # the same book. This should eventually
        # exceed the limit for the short tariff
        out = self.royalties.calculate([chapter, chapter])[0]
        assert out['tariff'] == 'short'
        assert out['tariff_message'] == (
            '2 Chapters within 10000 word and 100 page limit')
        assert out['cost'] == 0

        out = self.royalties.calculate([chapter, chapter, chapter])[0]
        assert out['tariff'] != 'short'

    def test_royalties_chapter_middle(self):
        chapter = {'id': 0,
                   'type': 'bookChapter',
                   'blob_id': 0,
                   'book_title': 'Introduction to ABC',
                   'id': 0,
                   'words': 12000,
                   'pages': 20,
                   'book_pages': 300}
        out = self.royalties.calculate([chapter])[0]
        assert out['tariff'] == 'middle'
        assert out['tariff_message'] == (
            'Chapter within 50 page limit')
        assert out['cost'] == 0
        # let's try this again with multiple chapters from
        # the same book. This should eventually
        # exceed the limit for the middle tariff
        out = self.royalties.calculate([chapter, chapter])[0]
        assert out['tariff'] == 'middle'
        assert out['tariff_message'] == (
            '2 Chapters within 50 page limit')
        assert out['cost'] == 0

        out = self.royalties.calculate([chapter, chapter, chapter])[0]
        assert out['tariff'] != 'middle'

        # note that if the book is small,
        # the 50 page limit might not be reached
        # since the total work should not exceed 25%
        chapter = {'id': 0,
                   'type': 'bookChapter',
                   'blob_id': 0,
                   'book_title': 'Introduction to ABC',
                   'id': 0,
                   'words': 12000,
                   'pages': 20,
                   'book_pages': 100}
        out = self.royalties.calculate([chapter])[0]
        assert out['tariff'] == 'middle'
        assert out['tariff_message'] == (
            'Chapter within 25 page limit')
        assert out['cost'] == 0

    def test_royalties_chapter_middle_pagecount_from_citation(self):
        # although the pdf is only 40 pages, the start and end page
        # indicate that 80 pages are used (2 pages per pdf page)
        chapter = {'id': 0,
                   'type': 'bookChapter',
                   'blob_id': 0,
                   'book_title': 'Introduction to ABC',
                   'id': 0,
                   'words': 12000,
                   'starting': 10,
                   'ending': 90,
                   'pages': 40,
                   'book_pages': 300}
        out = self.royalties.calculate([chapter])[0]
        assert out['tariff'] == 'long'
        assert out['cost_message'] == (
            '80 pages x 0.325 cents = 26.00')

    def test_royalties_oa_chapter(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'bookChapter',
             'book_title': 'Introduction to ABC',
             'book_pages': 300,
             'blob_id': 0,
             'exception': 'openAccess',
             'words': 15000,
             'pages': 60}])[0]
        assert out['tariff'] == 'excempt'
        assert out['tariff_message'] == 'Chapter published in open access'
        assert out['cost'] == 0

    def test_royalties_excempt_chapter(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'bookChapter',
             'book_title': 'Introduction to ABC',
             'book_pages': 300,
             'blob_id': 0,
             'exception': 'I am the author, and have complete ownership',
             'words': 15000,
             'pages': 60}])[0]
        assert out['tariff'] == 'excempt'
        assert out['tariff_message'] == 'Chapter is excempted'
        assert out['excempt_message'] == (
            'I am the author, and have complete ownership')
        assert out['cost'] == 0

    def test_royalties_long_chapter(self):
        chapter = {'id': 0,
                   'type': 'bookChapter',
                   'book_title': 'Introduction to ABC',
                   'book_pages': 300,
                   'blob_id': 0,
                   'words': 15000,
                   'pages': 60}
        out = self.royalties.calculate([chapter])[0]
        assert out['tariff'] == 'long'
        assert out['tariff_message'] == 'Chapter exceeds limits'
        assert out['cost'] == 1950
        assert out['cost_message'] == '60 pages x 0.325 cents = 19.50'
        chapter['language'] = 'nl'
        out = self.royalties.calculate([chapter])[0]
        assert out['tariff'] == 'long'
        assert out['tariff_message'] == 'Chapter exceeds limits'
        assert out['cost'] == 1548
        assert out['cost_message'] == '60 pages x 0.258 cents = 15.48'
        out = self.royalties.calculate([chapter, chapter])[0]
        assert out['tariff'] == 'long'
        assert out['tariff_message'] == 'Chapter exceeds limits'
        assert out['cost'] == 1548
        assert out['cost_message'] == '120 pages x 0.258 cents / 2 chapters = 15.48'

    def test_royalties_annotation(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'annotation',
             'link': 'https://een.url'}])[0]
        assert out['tariff'] == 'none'
        assert out['tariff_message'] == 'Excempted type: Law case annotation'
        assert out['cost'] == 0
        assert out.get('warning') is None

    def test_royalties_report(self):
        out = self.royalties.calculate([
            {'id': 0,
             'type': 'report',
             'link': 'https://een.url'}])[0]
        assert out['tariff'] == 'none'
        assert out['tariff_message'] == 'Excempted type: Report'
        assert out['cost'] == 0
        assert out.get('warning') is None
