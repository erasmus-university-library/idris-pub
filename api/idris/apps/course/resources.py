import datetime
import uuid
from operator import itemgetter

from zope.interface import implementer
import sqlalchemy as sql
from pyramid.security import Allow, Deny, Everyone, ALL_PERMISSIONS

from idris.interfaces import IAppRoot
from idris.resources import BaseResource, ResourceFactory
from idris.models import Work

@implementer(IAppRoot)
class CourseAppRoot(object):
    def __init__(self, request):
        self.request = request

    def __getitem__(self, key):
        if key == 'course':
            return ResourceFactory(CourseResource, request=self.request)
        raise KeyError('no such page: %s' % key)

class CourseResource(BaseResource):
    orm_class = Work
    key_col_name = 'id'


    def __acl__(self):

        teacher_permissions = ['course_view',
                               'course_update',
                               'course_material_view',
                               'course_material_add',
                               'add_blob',
                               'finalize_blob']

        if self.model and self.model.type != 'course':
            # only course works can be accessed through this api
            yield (Deny, Everyone, ALL_PERMISSIONS)
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        if self.model:
            yield (Allow,
                   'teacher:course:%s' % self.model.id,
                   teacher_permissions)
            if self.model.user_modified:
                # when a course is newly created, there is no
                # 'teacher:course:id' principal yet,
                # however we can still grant access to the
                # last_user_id principal
                yield (Allow,
                       'user:%s' % self.model.user_modified,
                       teacher_permissions)
            yield (Allow,
                   'student:course:%s' % self.model.id,
                   ['course_view', 'course_material_view'])
        # teachers are allowed to view other courses.
        # this is needed to import from another course
        yield (Allow, 'group:teacher', 'course_view')
        yield (Allow, 'group:teacher', 'course_add')
        yield (Allow, 'group:teacher', 'course_list')
        yield (Allow, 'system.Authenticated', 'view')


    def toc_items_royalty(self):
        query = sql.text("""
        SELECT
          w.id,
          w.type,
          w.issued,
          MAX(e.url) AS link,
          MAX(e.blob_id) as blob_id,
          MAX(CASE WHEN d.type='rights' THEN d.value ELSE NULL END) AS exception,
          MAX(CASE WHEN m.type='wordCount' THEN m.value ELSE NULL END) AS words,
          MAX(CASE WHEN m.type='pageCount' THEN m.value ELSE NULL END) AS pages,
          MAX(CASE WHEN r.type='book' THEN r.description ELSE NULL END) AS book_title,
          MAX(CASE WHEN (r.type='book') THEN r.total ELSE NULL END) AS book_pages,
          MAX(CASE WHEN (
            r.type='book' OR r.type = 'journal') THEN r.starting ELSE NULL END) AS starting,
          MAX(CASE WHEN (r.type='book' OR r.type = 'journal') THEN r.ending ELSE NULL END) AS ending
        FROM relations AS toc
        JOIN works w ON toc.target_id = w.id
        LEFT JOIN measures m ON m.work_id = w.id
        LEFT JOIN relations r ON r.work_id = w.id
        LEFT JOIN descriptions d ON d.work_id = w.id
        LEFT JOIN expressions e on e.work_id = w.id
        WHERE toc.work_id=:course_id
         GROUP BY
          w.id,
          w.type,
          w.issued,
          w.title""")
        params = dict(course_id=self.model.id)
        result = []
        for row in self.session.execute(query, params):
            result.append(dict(row))
        return result

    def material_data_to_csl(self, material):
        csl = {'title': material['title'],
               'id': material.get('id'),
               'type': {'article': 'article-journal',
                        'courseArticle': 'article-journal',
                        'chapter': 'book-chapter',
                        'bookChapter': 'book-chapter',
                        'courseBookChapter': 'book-chapter',
                        'book': 'book',
                        'report': 'report'}.get(material['type'], 'entry')}
        date_parts = []
        if material.get('issued'):
            date_parts.append(str(material['issued'].year))
        elif material.get('year'):
            date_parts.append(str(material['year']))
        csl['issued'] = {'date-parts': [date_parts]}

        if material.get('journal'):
            csl['container-title'] = material['journal']
        if material.get('book_title'):
            csl['container-title'] = material['book_title']
            csl['total'] = material['book_pages']
        if material.get('issue'):
            csl['issue'] = material['issue']
        if material.get('volume'):
            csl['volume'] = material['volume']
        if material.get('starting') and material.get('ending'):
            csl['page'] = '%s-%s' % (material.get('starting'),
                                      material.get('ending'))
        elif material.get('ending'):
            csl['page'] = '%s' % material.get('starting')

        if material.get('doi'):
            csl['DOI'] = '10.%s' % material['doi'].split('10.')[-1]
        csl['author'] = []
        authors = None
        if isinstance(material.get('authors'), str):
            authors = [material['authors']]
        for author in authors or material.get('authors', []):
            if not author or author in csl['author']:
                continue
            csl['author'].append(author)
        csl['author'] = [{'literal': a} for a in csl['author']]
        return csl

    def toc_items_csl(self):
        result = {}
        for material in self.toc_items():
            result[material['id']] = self.material_data_to_csl(material)
        return result

    def toc_items(self):
        query = sql.text("""
        SELECT
          w.id,
          w.type,
          w.issued,
          w.title,
          MAX(CASE WHEN m.type='wordCount' THEN m.value ELSE NULL END) AS words,
          MAX(CASE WHEN m.type='pageCount' THEN m.value ELSE NULL END) AS pages,
          MAX(CASE WHEN r.type='book' THEN r.description ELSE NULL END) AS book_title,
          MAX(CASE WHEN r.type='journal' THEN r.description ELSE NULL END) AS journal,
          MAX(CASE WHEN r.type='journal' THEN r.volume ELSE NULL END) AS volume,
          MAX(CASE WHEN r.type='journal' THEN r.issue ELSE NULL END) AS issue,
          MAX(CASE WHEN i.type='doi' THEN i.value ELSE NULL END) AS doi,
          MAX(r.starting) AS starting,
          MAX(r.ending) AS ending,
          MAX((CASE WHEN r.type='book' THEN r.total ELSE NULL END)) AS book_pages,
          array_agg(CASE WHEN c.role = 'author' THEN
                       c.description ELSE
                       NULL END ORDER BY c.position) AS authors
        FROM relations AS toc
        JOIN works w ON toc.target_id = w.id
        LEFT JOIN contributors c ON c.work_id = w.id
        LEFT JOIN measures m ON m.work_id = w.id
        LEFT JOIN relations r ON r.work_id = w.id
        LEFT JOIN identifiers i ON i.work_id = w.id
        WHERE toc.work_id=:course_id
        GROUP BY
          w.id,
          w.type,
          w.issued,
          w.title""")
        params = dict(course_id=self.model.id)
        result = []
        for row in self.session.execute(query, params):
            result.append(dict(row))
        return result

    def courses(self, group_id, course_year=None):
        query = sql.text("""
        SELECT w.id AS id,
               w.title AS title,
               to_char(lower(w.during), 'YYYY-mm-dd') as start_date,
               to_char(upper(w.during), 'YYYY-mm-dd') as end_date,
               MAX(CASE WHEN i.type = 'courseCode'
                        THEN i.value
                        ELSE NULL
                   END) AS code,
               COUNT(distinct r.target_id) AS literature
        FROM works AS w
        JOIN contributors AS c ON c.work_id = w.id
        LEFT JOIN identifiers AS i ON i.work_id = w.id
        LEFT JOIN relations AS r ON r.work_id = w.id
        WHERE c.role = 'publisher' AND
              c.group_id = :group_id AND
              course_year(w.issued) = :course_year
        GROUP BY w.id, w.title, start_date, end_date
        """)
        params = dict(group_id=group_id, course_year=course_year)
        listing = []
        for row in self.session.execute(query, params):
            listing.append(dict(row))
        return listing

    def navigation(self):
        query = sql.text("""
        SELECT g.name AS group_name,
               g.id AS group_id,
               course_year(w.issued) AS year,
               COUNT(w.id) AS courses
        FROM contributors AS c
        JOIN works AS w ON c.work_id = w.id
        JOIN groups AS g ON c.group_id = g.id
        WHERE c.role = 'publisher' AND
              c.group_id IS NOT NULL AND
              w.type = 'course'
        GROUP BY g.name, g.id, year
        """)
        counts = {}

        for row in self.session.execute(query):
            fac_count = counts.get(row.group_id)
            if fac_count is None:
                fac_count = {'name': row.group_name,
                             'id': row.group_id,
                             'total': 0,
                             'years': {}}
                counts[row.group_id] = fac_count
            fac_count['total'] += row.courses
            fac_count['years'][row.year] = row.courses
        nav = list(counts.values())
        nav.sort(key=itemgetter('name'))
        return nav

    def from_course_material_data(self, data):
        """ Import material data into work record
        See views.course.CourseMaterialSchema for data format
        """
        work = {
            'title': data['title'],
            'type': data['type'],
            'issued': datetime.date(data['year'], 1, 1)
        }
        if data.get('authors'):
            work.setdefault('contributors', []).append({
                'role': 'author',
                'description': data['authors']
            })
        if data.get('words'):
            work.setdefault('measures', []).append(
                dict(type='wordCount', value=data['words']))
        if data.get('pages'):
            work.setdefault('measures', []).append(
                dict(type='pageCount', value=data['pages']))
        if data.get('exception'):
            work.setdefault('descriptions', []).append(
                dict(type='rights',
                     format='text',
                     value=data['exception']))
        if data.get('journal') or data.get('book_title'):
            relation = {'issue': data.get('issue'),
                        'volume': data.get('volume'),
                        'starting': data.get('starting'),
                        'ending': data.get('ending')}
            if data['type'] == 'article':
                relation['description'] = data['journal'],
                relation['type'] = 'journal'
            elif data['type'] == 'bookChapter':
                relation['description'] = data['book_title'],
                relation['type'] = 'book'
                relation['total'] = data.get('book_pages')

            work.setdefault('relations', []).append(relation)
        if data.get('doi'):
            if data.get('link') is None:
                data['link'] = 'https://doi.org/%s' % data['doi']
            work.setdefault('identifiers', []).append({
                'type': 'doi', 'value': data['doi']})
        if data.get('blob_id'):
            # blobs have precedence over (doi) links
            work.setdefault('expressions', []).append({
                'name': 'fulltext',
                'type': 'publication',
                'format': 'published',
                'access': 'public',
                'blob_id': data['blob_id'],
                'blob_preview': 'thumb'})
        if data.get('link'):
            work.setdefault('expressions', []).append({
                'name': 'fulltext',
                'type': 'publication',
                'format': 'published',
                'access': 'public',
                'url': data['link']})
        return Work.from_dict(work)

    def from_course_data(self, data):
        data['issued'] = data['start_date']
        if 'group' in data:
            data.setdefault('contributors', []).append(
                {'role': 'publisher', 'group_id': data.pop('group')})
        if 'toc_items' in data:
            del data['toc_items']
        for key in [key for key in data if key.endswith('_id')]:
            value = data.pop(key)
            id_key = key[:-3]
            if id_key == 'course':
                id_key = 'courseCode'
            data.setdefault('identifiers', []).append(
                {'type': id_key, 'value': value})
        if 'toc' in data:
            for toc in data.get('toc', []):
                toc['type'] = 'toc'
                comment = toc.pop('comment', None)
                module = toc.pop('module', None)
                module_id= toc.pop('module_id', None)
                if module:
                    toc['location'] = 'module'
                    toc['description'] = module
                    toc['number'] = module_id or str(uuid.uuid4())
                elif comment:
                    toc['description'] = comment
            data['relations'] = data.pop('toc')
        self.model.update_dict(data)

    def to_course_data(self):
        course = self.model
        result = {'title': course.title,
                  'id': course.id,
                  'start_date': course.during.lower,
                  'end_date': course.during.upper,
                  'group': None,
                  'toc': []}
        for contrib in course.contributors:
            if contrib.role == 'publisher':
                result['group'] = contrib.group_id
        for identifier in course.identifiers:
            if identifier.type == 'courseCode':
                id_key = 'course_id'
            elif identifier.type in ['lti', 'canvas']:
                id_key = '%s_id' % identifier.type
            else:
                continue
            result[id_key] = identifier.value
        for rel in course.relations:
            if not rel.type == 'toc':
                continue
            toc = {'id': rel.id,
                   'target_id': rel.target_id,
                   'comment': rel.description}
            if rel.location == 'module':
                toc['module'] = rel.description
                toc['module_id'] = rel.number
                del toc['comment']
            result['toc'].append(toc)
        return result
