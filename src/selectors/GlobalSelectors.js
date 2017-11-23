import { getAuthenticatedUserId,
         getRecordTypes,
         getSettingsIsFetching } from './SettingsSelectors';
import { getLoginFormState as getLoginFormStateUI} from './UISelectors';
import { getSelectedRecordType,
         getSelectedRecordFilters,
         getRecordListIsFetching,
         getRecordDetailIsFetching} from './RecordSelectors';

export const getIsFetching = (state) => {
    return getSettingsIsFetching(state) || getRecordListIsFetching(state) || getRecordDetailIsFetching(state);
}

export const getLoginFormState = (state) => {
    const formState = getLoginFormStateUI(state);
    if (getAuthenticatedUserId(state) !== null){
        formState.open = false;
    }
    return formState;
};

export const getSelectedRecordTypeSettings = (state) => {
   const selectedRecordType = getSelectedRecordType(state);
   const recordType = getRecordTypes(state).filter((type) => type.id === selectedRecordType)[0];
   return recordType || null;
}

export const getSelectedRecordListingSettings = (state) => {
    const recordType = getSelectedRecordTypeSettings(state);
    if (recordType){
        return {fields: recordType.fields,
                label: recordType.label,
                labelPlural: recordType.label_plural};
    } else {
        return {};
    }

};

export const getSubmittedErrors = (state) => {
    const recordTypeId = getSelectedRecordType(state)
    if (!recordTypeId || !state.form[recordTypeId]){
        return null
    }
    return state.form[recordTypeId].submitErrors || null;
}
export const getTypeNavigation = (state) => {
    const selectedRecordId = getSelectedRecordType(state);
    const selectedRecordFilters = getSelectedRecordFilters(state);
    const types = []; getRecordTypes(state);
    let navType = {};
    let navFilter = {};
    let navFilterValue = {};
    for (const type of getRecordTypes(state)){
        navType = {
            id: type.id,
            label: type.label,
            filtersOpen: false,
            filters: []};
        if (selectedRecordId === type.id){
            navType.filtersOpen = true;
        }
        for(const filter of type.filters){
            navFilter = {
                id: filter.id,
                label: filter.label,
                values: []};
            for (const value of filter.values){
                navFilterValue = {
                    id: value.id,
                    label: value.label,
                    isSelected: false
                };
                if ((selectedRecordFilters[filter.id] || []).indexOf(value.id) !== -1){
                    navFilterValue.isSelected = true;
                }
                navFilter.values.push(navFilterValue);
            }
            navType.filters.push(navFilter);
        }
        types.push(navType);
    }
    return types
};


export const getDetailOpen = (state) => {
    if (state.record.detail.id){
        return true;
    } else {
        return false;
    }
}
