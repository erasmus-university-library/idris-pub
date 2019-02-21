import math
from decimal import Decimal

from zope.interface import implementer

from idris.interfaces import ICourseRoyaltyCalculator

@implementer(ICourseRoyaltyCalculator)
class ProCourseRoyaltyCalculator2017(object):
    royalty_agency = 'Stiching PRO'
    tariff_long_cost_per_page_dutch = Decimal('0.253')
    tariff_long_cost_per_page_foreign = Decimal('0.319')
    tariff_short_max_article_words = 8000
    tariff_short_max_chapter_words = 10000
    tariff_short_max_chapter_from_total_work_percentage = 33.33
    tariff_middle_max_from_total_work_percentage = 25
    tariff_middle_max_pages = 50

    def calculate(self, materials):
        results = []
        # make sure all digits are converted to numbers
        # before proceeding and all pagecounts are
        # calculated
        for material in materials:
            for number_field in ['starting', 'ending', 'book_pages',
                                 'words', 'pages']:
                if number_field in material:
                    if str(material[number_field]).isdigit():
                        material[number_field] = int(material[number_field])
                    else:
                        del material[number_field]
            if (material.get('starting') and
                material.get('ending') and
                material.get('pages')):
                # instead of the number of pages in the pdf
                # use the calculated number from the start/end page
                # if it is larger. This is needed if a pdf contains
                # multiple (2) pages per page.
                pages = material['ending'] - material['starting']
                if pages > material['pages']:
                    material['pages'] = pages

        for material in materials:
            result = {'id': material['id']}
            if material.get('type') is None:
                result['tariff'] = 'unknown'
                result['warning'] = 'no_type'
                result['warning_message'] = 'Material has no valid type'
                result['cost'] = 0
            elif (material.get('blob_id') is None and
                  material.get('link') is None):
                result['tariff'] = 'unknown'
                result['warning'] = 'no_content'
                result['warning_message'] = 'Material has no link or PDF'
                result['cost'] = 0
            elif material['type'] == 'annotation':
                result['tariff'] = 'none'
                result['tariff_message'] = 'Excempted type: Law case annotation'
                result['cost'] = 0
            elif material['type'] == 'report':
                result['tariff'] = 'none'
                result['tariff_message'] = 'Excempted type: Report'
                result['cost'] = 0
            elif (material.get('blob_id') is None and
                  material.get('link')):
                result['tariff'] = 'none'
                result['tariff_message'] = 'External URL'
                result['cost'] = 0
            elif (material.get('words') is None):
                result['tariff'] = 'unknown'
                result['warning'] = 'bad_wordcount'
                result['warning_message'] = 'Unknown count of words'
                result['cost'] = 0
            elif (material.get('words') is not None and
                  material.get('words') < 25):
                result['tariff'] = 'unknown'
                result['warning'] = 'bad_wordcount'
                result['warning_message'] = 'Unusual low count of words'
                result['cost'] = 0
            elif (material.get('pages') is None):
                result['tariff'] = 'unknown'
                result['warning'] = 'bad_pagecount'
                result['warning_message'] = 'Unknown count of pages'
                result['cost'] = 0
            elif (material['type'] == 'article' and
                  material['words'] <= self.tariff_short_max_article_words):
                result['tariff'] = 'short'
                result['tariff_message'] = 'Article within %s word limit' % (
                    self.tariff_short_max_article_words,)
                result['cost'] = 0
            elif (material['type'] == 'article' and
                  material['pages'] <= self.tariff_middle_max_pages):
                result['tariff'] = 'middle'
                result['tariff_message'] = 'Article within %s page limit' % (
                    self.tariff_middle_max_pages,)
                result['cost'] = 0
            elif (material['type'] == 'article' and
                  material.get('exception') == 'openAccess'):
                result['tariff'] = 'excempt'
                result['tariff_message'] = 'Article published in open access'
                result['excempt_message'] = material['exception']
                result['cost'] = 0
            elif (material['type'] == 'article' and
                  material.get('exception')):
                result['tariff'] = 'excempt'
                result['tariff_message'] = 'Article is excempted'
                result['excempt_message'] = material['exception']
                result['cost'] = 0
            elif material['type'] == 'article':
                result['tariff'] = 'long'
                result['tariff_message'] = 'Article exceeds limits'
                if material.get('language') == 'nl':
                    tariff = self.tariff_long_cost_per_page_dutch
                else:
                    tariff = self.tariff_long_cost_per_page_foreign
                cost = tariff * material['pages']
                result['cost'] = int(cost * 100)
                result['cost_message'] = '%s pages x %s cents = %.2f' % (
                    material['pages'], tariff, cost)
            elif (material['type'] == 'bookChapter' and
                  material.get('book_pages') is None):
                result['tariff'] = 'unknown'
                result['warning'] = 'no_bookpage_count'
                result['warning_message'] = 'Unknown book page count'
                result['cost'] = 0
            elif (material['type'] == 'bookChapter' and
                  material.get('book_title') is None):
                result['tariff'] = 'unknown'
                result['warning'] = 'no_booktitle'
                result['warning_message'] = 'Missing book title'
                result['cost'] = 0
            elif material['type'] == 'bookChapter':
                # calculate book chapter logic
                max_short_pages = math.ceil(material['book_pages'] * (
                    self.tariff_short_max_chapter_from_total_work_percentage /
                    100.0))
                max_middle_pages = math.ceil(material['book_pages'] * (
                    self.tariff_middle_max_from_total_work_percentage / 100.0))

                all_chapters = [
                    m for m in materials
                    if m.get('book_title') == material['book_title']]
                total_words = sum([m['words'] for m in all_chapters])
                total_pages = sum([m['pages'] for m in all_chapters])
                total_exceptions = [m.get('exception') for m in all_chapters
                                   if m.get('exception')]
                if (total_words <= self.tariff_short_max_chapter_words and
                    total_pages <= max_short_pages):
                    result['tariff'] = 'short'
                    if len(all_chapters) == 1:
                        result['tariff_message'] = (
                            'Chapter within %s word and %s page limit' % (
                                self.tariff_short_max_chapter_words,
                                max_short_pages))
                    else:
                        result['tariff_message'] = (
                            '%s Chapters within %s word and %s page limit' % (
                                len(all_chapters),
                                self.tariff_short_max_chapter_words,
                                max_short_pages))
                    result['cost'] = 0
                elif (total_pages <= min(self.tariff_middle_max_pages,
                                         max_middle_pages)):
                    result['tariff'] = 'middle'
                    if len(all_chapters) == 1:
                        result['tariff_message'] = (
                            'Chapter within %s page limit' % (
                                min(self.tariff_middle_max_pages,
                                    max_middle_pages),))
                    else:
                        result['tariff_message'] = (
                            '%s Chapters within %s page limit' % (
                                len(all_chapters),
                                min(self.tariff_middle_max_pages,
                                    max_middle_pages)))
                    result['cost'] = 0
                elif 'openAccess' in total_exceptions:
                    result['tariff'] = 'excempt'
                    result['tariff_message'] = 'Chapter published in open access'
                    result['excempt_message'] = total_exceptions[0]
                    result['cost'] = 0
                elif total_exceptions:
                    result['tariff'] = 'excempt'
                    result['tariff_message'] = 'Chapter is excempted'
                    result['excempt_message'] = total_exceptions[0]
                    result['cost'] = 0
                elif (total_words <= self.tariff_short_max_chapter_words and
                    total_pages > max_short_pages):
                    result['tariff'] = 'unknown'
                    result['warning'] = 'max_pages_reached'
                    result['warning_message'] = (
                        'A maximum of %s pages from this book'
                        ' can be used' % max_short_pages)
                    result['cost'] = 0
                elif (total_pages > max_middle_pages):
                    result['tariff'] = 'unknown'
                    result['warning'] = 'max_pages_reached'
                    result['warning_message'] = (
                        'A maximum of %s pages from this book'
                        ' can be used' % max_middle_pages)
                    result['cost'] = 0
                else:
                    result['tariff'] = 'long'
                    result['tariff_message'] = 'Chapter exceeds limits'
                    if material.get('language') == 'nl':
                        tariff = self.tariff_long_cost_per_page_dutch
                    else:
                        tariff = self.tariff_long_cost_per_page_foreign
                    cost = (tariff * total_pages) / Decimal(len(all_chapters))
                    result['cost'] = math.ceil(cost * 100)
                    if len(all_chapters) == 1:
                        result['cost_message'] = (
                            '%s pages x %s cents = %.2f' % (
                                total_pages, tariff, cost))
                    else:
                        result['cost_message'] = (
                            '%s pages x %s cents / %s chapters = %.2f' % (
                                total_pages,
                                tariff,
                                len(all_chapters),
                                cost))
            results.append(result)
        return results

@implementer(ICourseRoyaltyCalculator)
class ProCourseRoyaltyCalculator2018(ProCourseRoyaltyCalculator2017):
    tariff_long_cost_per_page_dutch = Decimal('0.258')
    tariff_long_cost_per_page_foreign = Decimal('0.325')

def course_royalty_calculator_factory(registry, course_year):
    course_year = str(course_year)
    if course_year < '2017':
        course_year = '2017'
    calculator = None
    while calculator is None:
        calculator = registry.queryUtility(
            ICourseRoyaltyCalculator, course_year)
        course_year = str(int(course_year) - 1)
        if course_year == '2017':
            break
    return calculator
