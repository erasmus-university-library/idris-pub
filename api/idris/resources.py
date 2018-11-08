import datetime
from intervals import DateInterval
from operator import itemgetter

import sqlalchemy as sql
from pyramid.httpexceptions import HTTPForbidden
from pyramid.security import Allow, Deny, Everyone, ALL_PERMISSIONS
from pyramid.interfaces import IAuthorizationPolicy
from sqlalchemy.orm import load_only, aliased
from sqlalchemy import func
import sqlalchemy.exc

from idris.models import (
    User, Person, Group, GroupType, GroupAccountType, PersonAccountType,
    Membership, Work, WorkType, Contributor, ContributorRole, Affiliation,
    IdentifierType, MeasureType, DescriptionType, DescriptionFormat, Blob,
    RelationType, Relation, PositionType,
    Expression, ExpressionType, ExpressionFormat, ExpressionAccessRight)
from idris.exceptions import StorageError


class ResourceFactory(object):
    def __init__(self, resource_class):
        self._class = resource_class

    def __call__(self, request, key=None):
        key = key or request.matchdict.get('id')
        resource = self._class(request.registry,
                               request.dbsession,
                               key)
        if key and resource.model is None:
            request.errors.status = 404
            request.errors.add('path', 'id', 'The resource id does not exist')
            raise HTTPForbidden()
        return resource


class BaseResource(object):
    orm_class = None
    key_col_name = None

    def __init__(self, registry, session, key=None, model=None):
        self.session = session
        self.registry = registry
        if model:
            self.model = model
        elif key:
            self.model = self.get(key)
        else:
            self.model = None

    def __acl__(self):
        return []

    def get(self, key=None, principals=None):
        if key is None:
            if principals and self.model and not self.is_permitted(self.model,
                                                                   principals,
                                                                   'view'):
                return None
            return self.model
        return self.get_many([key], principals=principals)[0]

    def get_many(self, keys, principals=None):
        """
        Retrieve multiple models for a list of keys.

        Note that this method always returns the same number of
        models as the number of keys in the same order.
        Models can be None if not found, or if principals are specified
        and the model view is not permitted.
        """

        pkey_col = getattr(self.orm_class, self.key_col_name)
        keys = [int(k) for k in keys]
        models_by_id = {getattr(r, self.key_col_name): r for r in
                        self.session.query(self.orm_class).filter(
            pkey_col.in_(keys)).all()}
        models = []
        for key in keys:
            model = models_by_id.get(key)
            if model is None:
                models.append(None)
            elif principals and not self.is_permitted(model,
                                                      principals,
                                                      'view'):
                raise HTTPForbidden(
                    'Failed ACL check: permission "view" on %s %s' % (
                        self.orm_class.__name__, key))
            else:
                models.append(model)
        return models

    def generate_next_id(self):
        pkey_col = getattr(self.orm_class, self.key_col_name)
        return self.session.execute(
            sql.func.next_value(pkey_col.default)).scalar()

    @classmethod
    def pre_put_hook(cls, model):
        return model

    def put(self, model=None, principals=None):
        if model is None:
            if self.model is None:
                raise ValueError('No model to put')
            model = self.model
        return self.put_many([model], principals=principals)[0]

    def put_many(self, models, principals=None):
        if not models:
            return
        for model in models:
            key = getattr(model, self.key_col_name)
            if key is None:
                permission = 'add'
            else:
                permission = 'edit'
            model = self.__class__.pre_put_hook(model)
            self.session.add(model)
            if principals and not self.is_permitted(
                    model, principals, permission):
                raise HTTPForbidden(
                    'Failed ACL check: permission "%s" on %s %s' % (
                        permission, self.orm_class.__name__, key))
        try:
            self.session.flush()
        except sqlalchemy.exc.IntegrityError as err:
            print(err)
            raise StorageError.from_err(err)

        for model in models:
            if model.__table__.name == 'works':
                # make sure that affiliation table holds work id
                # this does not automatically propagate in certain
                # conditions
                for contributor in model.contributors:
                    for affiliation in contributor.affiliations:
                        if not affiliation.work_id:
                            affiliation.work_id = model.id
                            self.session.add(affiliation)
        if self.session.dirty:
            self.session.flush()

        return models

    def delete(self, model=None, principals=None):
        if model is None:
            if self.model is None:
                raise ValueError('No model to delete')
            model = self.model
        self.session.delete(model)
        if principals and not self.is_permitted(
                model, principals, 'delete'):
            raise HTTPForbidden('Failed ACL check for permission "delete"')
        self.session.flush()

    def search(self,
               filters=None,
               principals=None,
               limit=100,
               offset=0,
               order_by=None,
               format=None,
               from_query=None,
               from_query_joined_tables=None,
               post_query_callback=None,
               apply_limits_post_query=False,
               keys_only=False):
        query = from_query or self.session.query(self.orm_class)

        order_by = order_by or []
        if not isinstance(order_by, list):
            order_by = [order_by]

        if filters:
            query = query.filter(sql.and_(*filters))
        acl_filters = []
        acl_joined_tables = [t.__table__.name
                             for t in (from_query_joined_tables or [])]
        for filter in self.acl_filters(principals):
            first_clause = filter
            if not hasattr(first_clause, 'left'):
                first_clause = filter.clauses[0]
            if (first_clause.left.table.name != self.orm_class.__table__.name and
                first_clause.left.table.name not in acl_joined_tables):
                # acl requires filter on other table
                query = query.join(first_clause.left.table)
                acl_joined_tables.append(first_clause.left.table.name)
            acl_filters.append(filter)

        if acl_filters:
            query = query.filter(sql.or_(*acl_filters))

        if not apply_limits_post_query:
            total = query.count()
            query = query.order_by(*order_by)
            query = query.offset(offset)
            query = query.limit(limit)
        if post_query_callback:
            # useful for cte aggregations, etc
            query = post_query_callback(query)
            if apply_limits_post_query:
                total = query.count()
                query = query.order_by(*order_by)
                query = query.offset(offset)
                query = query.limit(limit)

        if keys_only:
            query = query.options(load_only(self.key_col_name))
        return {'total': total,
                'hits': [h for h in query.all()]}

    def is_permitted(self, model, principals, permission):
        policy = self.registry.queryUtility(IAuthorizationPolicy)
        context = self.__class__(self.registry, self.session, model=model)
        permitted = policy.permits(context, principals, permission)
        if bool(permitted) is False:
            return False
        return True

    def acl_filters(self, principals):
        return []


class UserResource(BaseResource):
    orm_class = User
    key_col_name = 'id'

    def __acl__(self):
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        if self.model:
            # users can view their own info
            yield (Allow, 'user:%s' % self.model.userid, 'view')
        elif self.model is None:
            # no model loaded yet, allow container view
            yield (Allow, 'system.Authenticated', 'view')

    def acl_filters(self, principals):
        filters = []
        if 'group:admin' in principals:
            return filters
        # only return the user object of logged in user
        user_ids = [
            p.split(':', 1)[1] for p in principals if p.startswith('user:')]
        for user_id in user_ids:
            filters.append(User.userid == user_id)
        return filters

    @classmethod
    def pre_put_hook(cls, model):
        search_terms = [model.userid]
        model.search_terms = sql.func.to_tsvector(' '.join(search_terms))
        return model


class PersonResource(BaseResource):
    orm_class = Person
    key_col_name = 'id'

    def __acl__(self):
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        yield (Allow, 'system.Authenticated', 'search')
        yield (Allow, 'group:manager', ['view', 'add', 'edit', 'delete'])
        yield (Allow, 'group:editor', ['view', 'add', 'edit', 'delete'])
        if self.model:
            # person owners can view and edit persons
            yield (Allow, 'owner:person:%s' % self.model.id, ['view', 'edit'])
            for membership in self.model.memberships:
                # group owners can view and edit persons
                yield (Allow,
                       'owner:group:%s' % membership.group_id,
                       ['view', 'edit'])

        elif self.model is None:
            # no model loaded yet, allow container view
            yield (Allow, 'system.Authenticated', 'view')

    @classmethod
    def pre_put_hook(cls, model):
        if model.family_name:
            name = model.family_name
            search_terms = [name]
            if model.family_name_prefix:
                name = '%s %s' % (model.family_name_prefix, name)
                search_terms.append(model.family_name_prefix)
            if model.initials:
                name = '%s, %s' % (name, model.initials)
                search_terms.append(model.initials)
            if model.given_name:
                name = '%s (%s)' % (name, model.given_name)
                search_terms.append(model.given_name)
        else:
            name = model.alternative_name
            search_terms = [model.alternative_name]
        model.name = name
        model.search_terms = sql.func.to_tsvector(' '.join(search_terms))
        return model

    def acl_filters(self, principals):
        filters = []
        owner_group_ids = []
        for principal in principals:
            if principal in {'group:admin',
                             'group:manager',
                             'group:editor'}:
                return []
            if principal.startswith('owner:person:'):
                filters.append(Person.id == principal.split(':')[-1])
            if principal.startswith('owner:group:'):
                owner_group_ids.append(int(principal.split(':')[-1]))

        if owner_group_ids:
            filters.append(sql.or_(*[Membership.group_id == i
                                     for i in set(owner_group_ids)]))
        if not filters:
            # match nothing
            filters.append(Person.id == -1)
        return filters


class GroupResource(BaseResource):
    orm_class = Group
    key_col_name = 'id'

    def __acl__(self):
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        yield (Allow, 'system.Authenticated', 'search')
        yield (Allow, 'group:manager', ['view', 'add', 'edit', 'delete'])
        yield (Allow, 'group:editor', ['view', 'add', 'edit', 'delete'])
        if self.model:
            # owners can view and edit groups
            yield (Allow, 'owner:group:%s' % self.model.id, ['view', 'edit'])
        elif self.model is None:
            # no model loaded yet, allow container view
            yield (Allow, 'system.Authenticated', 'view')

    @classmethod
    def pre_put_hook(cls, model):
        model.name = model.international_name
        search_terms = [model.international_name]

        if model.abbreviated_name:
            model.name = '%s (%s)' % (model.name, model.abbreviated_name)
            search_terms.append(model.abbreviated_name)

        model.search_terms = sql.func.to_tsvector(' '.join(search_terms))
        return model

    def acl_filters(self, principals):
        filters = []
        owner_group_ids = []
        for principal in principals:
            if principal in {'group:admin',
                             'group:manager',
                             'group:editor'}:
                return []
            if principal.startswith('owner:group:'):
                owner_group_ids.append(int(principal.split(':')[-1]))

        if owner_group_ids:
            filters.append(sql.or_(*[Group.id == i
                                     for i in set(owner_group_ids)]))

        if not filters:
            # match nothing
            filters.append(Group.id == -1)
        return filters

    def child_groups(self):
        query = sql.text('''
        WITH RECURSIVE rel_tree AS (
          SELECT id,
                 parent_id,
                 1 AS level,
                 ARRAY[id] AS path_info,
                 false AS cyclic
          FROM groups
          WHERE parent_id = :group_id
          UNION ALL
          SELECT c.id,
                 c.parent_id,
                 p.level + 1,
                 p.path_info||c.id,
                 c.id = ANY(p.path_info) as cyclic
          FROM groups c
          JOIN rel_tree p ON c.parent_id = p.id AND NOT cyclic)
        SELECT DISTINCT UNNEST(path_info) FROM rel_tree
        ''')
        return [row[0] for row in
                self.session.execute(query,
                                     dict(group_id=self.model.id)).fetchall()]


class WorkResource(BaseResource):
    orm_class = Work
    key_col_name = 'id'

    def __acl__(self):
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        yield (Allow, 'system.Authenticated', 'search')
        yield (Allow, 'group:manager', ['view', 'add', 'edit', 'delete'])
        yield (Allow, 'group:editor', ['view', 'add', 'edit', 'delete'])
        if self.model:
            # owners can view and edit groups
            for contributor in self.model.contributors:
                if contributor.person_id:
                    yield (Allow,
                           'owner:person:%s' % contributor.person_id,
                           ['view', 'edit'])
                elif contributor.group_id:
                    yield (Allow,
                           'owner:group:%s' % contributor.group_id,
                           ['view', 'edit'])
            for affiliation in self.model.affiliations:
                yield (Allow,
                       'owner:group:%s' % affiliation.group_id,
                       ['view', 'edit'])
        elif self.model is None:
            # no model loaded yet, allow container view
            yield (Allow, 'system.Authenticated', 'view')

    def acl_filters(self, principals):
        filters = []
        for principal in principals:
            if principal in {'group:admin',
                             'group:manager',
                             'group:editor'}:
                return []
            if principal.startswith('owner:person:'):
                filters.append(
                    Contributor.person_id == principal.split(':')[-1])
            elif principal.startswith('owner:group:'):
                filters.append(
                    Affiliation.group_id == principal.split(':')[-1])

        if not filters:
            # match nothing
            filters.append(Contributor.id == -1)
        return filters

    @classmethod
    def pre_put_hook(cls, model):
        search_terms = [model.title]
        model.search_terms = sql.func.to_tsvector(' '.join(search_terms))

        for contributor in model.contributors:
            ContributorResource.pre_put_hook(contributor)

        return model

    def put_many(self, models, principals=None):
        models = super(WorkResource, self).put_many(models,
                                                    principals=principals)
        # make sure that affiliation table holds work id
        # this does not automatically propagate in certain
        # conditions, so after storing a work, we make sure
        # all affiliations have a work id
        for model in models:
            for contributor in model.contributors:
                for affiliation in contributor.affiliations:
                    if not affiliation.work_id:
                        affiliation.work_id = model.id
                        self.session.add(affiliation)
        if self.session.dirty:
            self.session.flush()
        return models

    def listing(self,
                text_query=None,
                type=None,
                start_date=None,
                end_date=None,
                contributor_person_ids=None,
                contributor_group_ids=None,
                affiliation_group_ids=None,
                related_work_ids=None,
                offset=0,
                limit=100,
                order_by=None,
                principals=None):

        selected_work_ids = None
        if contributor_person_ids:
            query = self.session.query(Contributor.work_id.label('id'))
            query = query.filter(sql.or_(*[Contributor.person_id == pid
                                           for pid in contributor_person_ids]))
            query = query.group_by(Contributor.work_id)
            selected_work_ids = query.cte('selected_work_ids')
        elif contributor_group_ids:
            query = self.session.query(Contributor.work_id.label('id'))
            query = query.filter(sql.or_(*[Contributor.group_id == gid
                                           for gid in contributor_group_ids]))
            query = query.group_by(Contributor.work_id)
            selected_work_ids = query.cte('selected_work_ids')
        elif affiliation_group_ids:
            query = self.session.query(Affiliation.work_id.label('id'))
            query = query.filter(sql.or_(*[Affiliation.group_id == gid
                                           for gid in affiliation_group_ids]))
            query = query.group_by(Affiliation.work_id)
            selected_work_ids = query.cte('selected_work_ids')
        elif related_work_ids:
            query = self.session.query(Relation.work_id.label('id'))
            query = query.filter(sql.or_(*[Relation.target_id == wid
                                           for wid in related_work_ids]))
            query = query.group_by(Relation.work_id)
            selected_work_ids = query.cte('selected_work_ids')

        work_query = self.session.query(Work.id)
        if selected_work_ids is not None:
            work_query = work_query.join(
                selected_work_ids, selected_work_ids.c.id == Work.id)

        acl_filters = self.acl_filters(principals)
        if acl_filters:
            group_filters = [f for f in acl_filters
                             if f.left.table.name == 'affiliations']
            person_filters = [f for f in acl_filters
                              if f.left.table.name == 'contributors']
            if group_filters:
                query = self.session.query(Affiliation.work_id.label('id'))
                query = query.filter(sql.or_(*group_filters))
                query = query.group_by(Affiliation.work_id)
                allowed_work_ids = query.cte('allowed_work_ids')
                allowed_group_query = query
            if person_filters:
                query = self.session.query(Contributor.work_id.label('id'))
                query = query.filter(sql.or_(*person_filters))
                query = query.group_by(Contributor.work_id)
                allowed_work_ids = query.cte('allowed_work_ids')
                allowed_person_query = query
            if group_filters and person_filters:
                query = allowed_group_query.union(
                    allowed_person_query).group_by('id')
                allowed_work_ids = query.cte('allowed_work_ids')

            work_query = work_query.join(
                allowed_work_ids, allowed_work_ids.c.id == Work.id)

        if start_date or end_date:
            duration = DateInterval([start_date, end_date])
            work_query = work_query.filter(Work.during.op('&&')(duration))
        if text_query:
            work_query = work_query.filter(
                Work.title.ilike('%%%s%%' % text_query))
        if type:
            work_query = work_query.filter(Work.type == type)

        total = work_query.count()

        work_query = work_query.order_by(order_by or Work.issued.desc())
        work_query = work_query.limit(limit).offset(offset)

        filtered_work_ids = work_query.cte('filtered_work_ids')

        listed_works = self.session.query(
            Work.id.label('id'),
            Work.type.label('type'),
            Work.issued.label('issued'),
            Work.title).join(
                filtered_work_ids,
                filtered_work_ids.c.id == Work.id).cte('listed_works')
        Target = aliased(Work)

        full_listing = self.session.query(
            listed_works,
            func.json_agg(
                func.json_build_object('id', Contributor.id,
                                       'position', Contributor.position,
                                       'name', Person.name,
                                       'person_id', Person.id,
                                       'initials', Person.initials,
                                       'prefix', Person.family_name_prefix,
                                       'given_name', Person.given_name,
                                       'family_name', Person.family_name,
                                       'description', Contributor.description,
                                       'group_id', Contributor.group_id,
                                       'role', Contributor.role)
                          ).label('contributors'),
            func.json_agg(
                func.json_build_object('id', Relation.id,
                                       'relation_type', Relation.type,
                                       'type', Target.type,
                                       'location', Relation.location,
                                       'starting', Relation.starting,
                                       'ending', Relation.ending,
                                       'volume', Relation.volume,
                                       'issue', Relation.issue,
                                       'number', Relation.number,
                                       'title', Target.title)
                          ).label('relations'),
            func.array_agg(
              sql.distinct(
                  func.concat(Group.id,
                              ':',
                              Group.name))).label('affiliations')
            )

        full_listing = full_listing.outerjoin(
            Contributor, listed_works.c.id == Contributor.work_id).outerjoin(
              Person, Person.id == Contributor.person_id)
        full_listing = full_listing.outerjoin(
            Affiliation,
            Contributor.id == Affiliation.contributor_id).outerjoin(
              Group, Group.id == Affiliation.group_id)
        full_listing = full_listing.outerjoin(
            Relation, listed_works.c.id == Relation.work_id).outerjoin(
              Target, Target.id == Relation.target_id)

        full_listing = full_listing.group_by(listed_works).order_by(
            listed_works.c.issued.desc())

        hits = []
        contributor_role_ids = set(contributor_person_ids or [])
        for hit in full_listing.all():
            aff_labels = dict([tuple(a.split(':', 1)) for a in hit.affiliations])
            contributors = []
            roles = set()

            # filter out contributor rows with a null id.
            # this happens with course relations
            contributor_rows = [c for c in hit.contributors if c.get('id')]
            contributor_rows.sort(key=itemgetter('position'))

            for contributor in contributor_rows:
                if contributor['person_id'] in contributor_role_ids:
                    roles.add(contributor['role'])
                if (contributors and
                    contributors[-1]['position'] == contributor['position']):
                    # same contributor as previous one, (but other affiliation
                    # it's hard to remove this with a distinct clause
                    # in the json agg, so we remove it here
                    continue
                cg_id = contributor['group_id']
                if cg_id and str(cg_id) in aff_labels:
                    # a group contributor is always added as an affiliation
                    contributor['group_name'] = aff_labels[str(cg_id)]
                contributors.append(contributor)
            affiliations = []
            for affiliation in hit.affiliations:
                id, name = affiliation.split(':', 1)
                affiliations.append(dict(id=id, name=name))

            hits.append({'id': hit.id,
                         'title': hit.title,
                         'type': hit.type,
                         'roles': list(roles),
                         'issued': hit.issued.strftime('%Y-%m-%d'),
                         'relations': hit.relations,
                         'affiliations': affiliations,
                         'contributors': contributors})

        return {'total': total,
                'hits': hits,
                'limit': limit,
                'offset': offset}

class MembershipResource(BaseResource):
    orm_class = Membership
    key_col_name = 'id'

    def __acl__(self):
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        yield (Allow, 'group:manager', ['view', 'add', 'edit', 'delete'])
        yield (Allow, 'group:editor', ['view', 'add', 'edit', 'delete'])
        if self.model:
            # group owners can view, add, and edit members
            yield (Allow, 'owner:group:%s' % self.model.group_id, ['view', 'add', 'edit', 'delete'])
            # person owners can only view memberships
            yield (Allow, 'owner:person:%s' % self.model.person_id, ['view'])
        elif self.model is None:
            # no model loaded yet, allow container view
            yield (Allow, 'system.Authenticated', 'view')

    def acl_filters(self, principals):
        filters = []
        for principal in principals:
            if principal in {'group:admin',
                             'group:manager',
                             'group:editor'}:
                return []
            if principal.startswith('owner:group:'):
                filters.append(Membership.group_id == principal.split(':')[-1])
            elif principal.startswith('owner:person:'):
                filters.append(
                    Membership.person_id == principal.split(':')[-1])
        return filters


    def listing(self,
                text_query=None,
                start_date=None,
                end_date=None,
                person_ids=None,
                group_ids=None,
                offset=0,
                limit=100,
                order_by=None,
                principals=None):

        query = self.session.query(
            Membership.person_id.label('person_id'),
            Person.name.label('person_name'),
            Person.family_name.label('person_name_sorted'),
            func.array_agg(
              sql.distinct(func.concat(Group.id, ':', Group.name))).label('groups'),
            func.min(func.coalesce(func.lower(Membership.during),
                                   datetime.date(1900, 1, 1))).label('earliest'),
            func.max(func.coalesce(func.upper(Membership.during),
                                   datetime.date(2100, 1, 1))).label('latest'),
            func.count(sql.distinct(Membership.id)).label('memberships')
            ).join(Person).join(Group).group_by(Membership.person_id,
                                                Person.name,
                                                Person.family_name)

        if person_ids:
            query = query.filter(sql.or_(*[Membership.person_id == pid
                                           for pid in person_ids]))
        if group_ids:
            query = query.filter(sql.or_(*[Membership.group_id == pid
                                           for pid in group_ids]))
        if start_date or end_date:
            duration = DateInterval([start_date, end_date])
            query = query.filter(Membership.during.op('&&')(duration))
        if text_query:
            query = query.filter(
                Person.name.ilike('%%%s%%' % text_query))

        total = query.count()

        query = query.order_by(order_by or Person.family_name)
        query = query.limit(limit).offset(offset)

        filtered_members = query.cte('members')
        full_listing = self.session.query(
            filtered_members,
            func.count(Contributor.work_id).label('works')
            )
        full_listing = full_listing.outerjoin(
            Contributor,
            filtered_members.c.person_id == Contributor.person_id)
        full_listing = full_listing.group_by(
            filtered_members).order_by(filtered_members.c.person_name_sorted)

        hits = []
        for hit in full_listing.all():
            earliest = hit.earliest
            if earliest:
                if earliest.year == 1900:
                    earliest = None
                else:
                    earliest = earliest.strftime('%Y-%m-%d')

            latest = hit.latest
            if latest:
                if latest.year == 2100:
                    latest = None
                else:
                    latest = latest.strftime('%Y-%m-%d')

            groups = []
            for group in hit.groups:
                id, name = group.split(':', 1)
                groups.append(dict(id=id, name=name))

            hits.append({'person_id': hit.person_id,
                         'person_name': hit.person_name,
                         'groups': groups,
                         'earliest': earliest,
                         'latest': latest,
                         'works': hit.works,
                         'memberships': hit.memberships})

        return {'total': total,
                'hits': hits,
                'limit': limit,
                'offset': offset}

class ContributorResource(BaseResource):
    orm_class = Contributor
    key_col_name = 'id'


    def __acl__(self):
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        yield (Allow, 'group:manager', ['view', 'add', 'edit', 'delete'])
        yield (Allow, 'group:editor', ['view', 'add', 'edit', 'delete'])
        if self.model:
            # group owners can view, add, and edit members
            yield (Allow,
                   'owner:group:%s' % self.model.group_id,
                   ['view', 'add', 'edit', 'delete'])
            # person owners can view, add, and edit works
            yield (Allow,
                   'owner:person:%s' % self.model.person_id,
                   ['view', 'add', 'edit', 'delete'])
        elif self.model is None:
            # no model loaded yet, allow container view
            yield (Allow, 'system.Authenticated', 'view')

    def acl_filters(self, principals):
        filters = []
        for principal in principals:
            if principal in {'group:admin',
                             'group:manager',
                             'group:editor'}:
                return []
            if principal.startswith('owner:group:'):
                filters.append(Contributor.group_id == principal.split(':')[-1])
            elif principal.startswith('owner:person:'):
                filters.append(
                    Contributor.person_id == principal.split(':')[-1])
        return filters

    @classmethod
    def pre_put_hook(cls, model):
        if model.group_id:
            # if a contributor with group_id is added
            # then add the group also as affiliation
            has_group_aff = [a for a in model.affiliations
                             if a.group_id == model.group_id]
            if not has_group_aff:
                model.affiliations.append(
                    Affiliation(group_id=model.group_id,
                                contributor_id=model.id,
                                work_id=model.work_id))

        return model


class AffiliationResource(BaseResource):
    orm_class = Affiliation
    key_col_name = 'id'


    def __acl__(self):
        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        yield (Allow, 'group:manager', ['view', 'add', 'edit', 'delete'])
        yield (Allow, 'group:editor', ['view', 'add', 'edit', 'delete'])
        if self.model:
            # group owners can view, add, and edit members
            yield (Allow,
                   'owner:group:%s' % self.model.group_id,
                   ['view', 'add', 'edit', 'delete'])
            # person owners can view, add, and edit works
            yield (Allow,
                   'owner:person:%s' % self.model.person_id,
                   ['view', 'add', 'edit', 'delete'])
        elif self.model is None:
            # no model loaded yet, allow container view
            yield (Allow, 'system.Authenticated', 'view')

    def acl_filters(self, principals):
        filters = []
        for principal in principals:
            if principal in {'group:admin',
                             'group:manager',
                             'group:editor'}:
                return []
        return filters


class TypeResource(object):
    schemes = {'group': GroupType,
               'work': WorkType,
               'identifier': IdentifierType,
               'measure': MeasureType,
               'position': PositionType,
               'relation': RelationType,
               'description': DescriptionType,
               'descriptionFormat': DescriptionFormat,
               'expression': ExpressionType,
               'expressionFormat': ExpressionFormat,
               'expressionAccess': ExpressionAccessRight,
               'contributorRole': ContributorRole,
               'groupAccount': GroupAccountType,
               'personAccount': PersonAccountType
               }
    orm = None

    def __acl__(self):
        yield (Allow, 'system.Authenticated', 'view')
        yield (Allow, 'group:admin', 'edit')

    def __init__(self, session, scheme_id):
        self.session = session
        self.scheme_id = scheme_id
        if scheme_id is not None:
            self.orm = self.schemes[scheme_id]
        self.model = None

    def from_dict(self, data):
        values = dict((v['key'], v['label']) for v in data['values'])
        for item in self.session.query(self.orm).all():
            if item.key not in values:
                self.session.delete(item)
            else:
                if values[item.key] != item.label:
                    item.label = values[item.key]
                    self.session.add(item)
                del values[item.key]
        for key, label in values.items():
            self.session.add(self.orm(key=key, label=label))
        self.session.flush()

    def to_dict(self):
        values = []
        for setting in self.session.query(self.orm).all():
            values.append({'key': setting.key, 'label': setting.label})
        return {'id': self.scheme_id, 'values': values}

    def list(self):
        listing = []
        for scheme_id in self.schemes.keys():
            res = TypeResource(self.session, scheme_id)
            listing.append(res.to_dict())
        return {'types': listing}


class BlobResource(BaseResource):
    orm_class = Blob
    key_col_name = 'id'

    def __acl__(self):
        if self.model:
            expr = self.session.query(Expression).filter(
                Expression.blob_id == self.model.id).scalar()
            if expr is None:
                # you can't download a blob,
                # if it's not attached to an expression
                yield (Deny, Everyone, ['download'])
            else:
                # XXX maybe also check work permissions?
                yield (Allow, 'group:manager', ['download'])
                yield (Allow, 'group:editor', ['download'])
                if expr.access == 'restricted':
                    yield (Allow, 'system.Authenticated', ['download'])
                elif expr.access == 'public':
                    yield (Allow, Everyone, ['download'])

        yield (Allow, 'group:admin', ALL_PERMISSIONS)
        yield (Allow, 'system.Authenticated', ['add', 'finalize', 'upload'])


class CourseResource(BaseResource):
    orm_class = Work
    key_col_name = 'id'


    def toc_items_royalty(self):
        query = sql.text("""
        SELECT
          w.id,
          w.type,
          w.issued,
          MAX(e.uri) AS link,
          MAX(e.blob_id) as blob_id,
          MAX(CASE WHEN d.type='rights' THEN d.value ELSE NULL END) AS rights,
          MAX(CASE WHEN m.type='wordCount' THEN m.value ELSE NULL END) AS words,
          MAX(CASE WHEN m.type='pageCount' THEN m.value ELSE NULL END) AS pages,
          MAX(CASE WHEN r.type='book' THEN r.description ELSE NULL END) AS book_title,
          MAX(CASE WHEN (r.type='book') THEN r.total ELSE NULL END) AS book_pages,
          MAX(CASE WHEN (r.type='book' OR r.type = 'journal') THEN r.starting ELSE NULL END) AS ending,
          MAX(CASE WHEN (r.type='book' OR r.type = 'journal') THEN r.ending ELSE NULL END) AS starting
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
          MAX(CASE WHEN r.type='journal' THEN r.description ELSE NULL END) AS journal,
          MAX(CASE WHEN r.type='journal' THEN r.volume ELSE NULL END) AS volume,
          MAX(CASE WHEN r.type='journal' THEN r.issue ELSE NULL END) AS issue,
          MAX(CASE WHEN i.type='doi' THEN i.value ELSE NULL END) AS doi,
          MAX(r.starting) AS starting,
          MAX(r.ending) AS ending,
          MAX(CASE WHEN r.type='book' THEN
                       r.description ELSE
                       NULL END) AS book_title,
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

    def __acl__(self):
        if self.model:
            if self.model.type != 'course':
                # only course works can be accessed through this api
                yield (Deny, Everyone, ALL_PERMISSIONS)

        yield (Allow, 'system.Authenticated', 'view')
        yield (Allow, 'group:admin', ALL_PERMISSIONS)

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
        if data.get('rights'):
            work.setdefault('descriptions', []).append(
                dict(type='rights',
                     format='text',
                     value=data['rights']))
        if data.get('journal') or data.get('book_title'):
            relation = {'issue': data.get('issue'),
                        'volume': data.get('volume'),
                        'starting': data.get('starting'),
                        'ending': data.get('ending')}
            if data.get('journal'):
                relation['description'] = data['journal'],
                relation['type'] = 'journal'
            else:
                relation['description'] = data['book_title'],
                relation['type'] = 'book'
                relation['total'] = 'book_pages'

            work.setdefault('relations', []).append(relation)
        if data.get('doi'):
            if data.get('link') is None:
                data['link'] = 'https://doi.org/%s' % data['doi']
            work.setdefault('identifiers', []).append({
                'type': 'doi', 'value': data['doi']})
        if data.get('link'):
            work.setdefault('expressions', []).append({
                'name': 'fulltext',
                'type': 'publication',
                'format': 'published',
                'access': 'public',
                'uri': data['link']})
        if data.get('blob_id'):
            work.setdefault('expressions', []).append({
                'name': 'fulltext',
                'type': 'publication',
                'format': 'published',
                'access': 'public',
                'blob_id': data['blob_id']})
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
                if module:
                    toc['location'] = 'module'
                    toc['description'] = module
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
            else:
                id_key = '%s_id' % identifier.type
            result[id_key] = identifier.value
        for rel in course.relations:
            if rel.type == 'toc':
                toc = {'id': rel.id,
                       'target_id': rel.target_id,
                       'comment': rel.description}
            if rel.location == 'module':
                toc['module'] = rel.description
                del toc['comment']
            result['toc'].append(toc)
        return result
