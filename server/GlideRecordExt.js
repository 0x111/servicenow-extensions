var GlideRecordExt = Class.create();
GlideRecordExt.prototype = {
    initialize: function(table) {
        this.gr = new GlideRecord(table);
        this.count = 0;
    },
    getOne: function(fieldName, sys_id) {
        // abstract the original functionality of the get method of GlideRecord
        if ((fieldName.length > 0 && fieldName.length == 32) && !sys_id) {
            if (this.gr.get(fieldName)) {
                this.increment(); // set the count to only 1 record
                return this.gr.sys_id;
            }
        }

        if (fieldName.length > 0 && (sys_id && sys_id.length == 32)) {
            if (this.gr.get(fieldName, sys_id)) {
                this.increment(); // set the count to only 1 record
                return this.gr.sys_id;
            }
        }

        return null;
    },
    // returns a value of a field
    getDBValue: function(fieldName) {
        return this.gr[fieldName].getValue();
    },
    // returns a display value of a field
    getDBDisplayValue: function(fieldName) {
        return this.gr[fieldName].getDisplayValue();
    },
    // where will be the user-friendly way to define a condition, more ways to follow
    where: function(fieldName, comp, value) {
        this.gr.addQuery(fieldName, comp, value);
    },
    // query for records with a simple equal condition
    equal: function(fieldName, value) {
        this.gr.addQuery(fieldName, value);
    },
    // run the query, more to follow
    run: function() {
        this.gr.query();
    },
    // creates a json object of the fields passed in the parameter
    // if the field has a distinct displayValue than value, then the displayValue will be also provided in a form of an object
    getJSONObject: function(fields) {
        var result = {},
            tmp = {},
            displayValue = "",
            dbValue = "";
        for (var i = 0; i < fields.length; i++) {
            displayValue = this.getDBDisplayValue(fields[i]);
            dbValue = this.getDBValue(fields[i]);

            if (this.hasDisplayValue(displayValue) && dbValue != displayValue) {
                tmp = {};
                tmp['display'] = displayValue;
                tmp['value'] = dbValue;
                result[fields[i]] = tmp;
            } else {
                result[fields[i]] = dbValue;
            }
        }
        return result;
    },
    // checks if the current field has a displayValue
    hasDisplayValue: function(displayValue) {
        if (displayValue && displayValue.length > 0) {
            return true;
        }

        return false;
    },
    // returns an array of objects with the specified fields, even if we have only one field
    getArrayOf: function(fields) {
        var isArray = Array.isArray(fields);
        // we require the parameter to be an array, nothing else suffices
        if (!isArray || fields.length == 0) {
            return [];
        }

        var result = [],
            tmp = {};
        if (isArray && fields.length > 0) {
            while (this.gr._next()) {
                tmp = {};
                // increase opcount
                this.increment();
                // iterate through the array of fields which we want to get
                for (var i = 0; i < fields.length; i++) {
                    tmp[fields[i]] = this.gr[fields[i]].getValue();
                }
                result.push(tmp);
            }
        }

        return result;
    },
    // returns true if there are any records and false if there are none
    hasRecords: function() {
        if (this.gr.hasNext()) {
            return true;
        }

        return false;
    },
    // return an array of sys_id's for the query
    getSysIDArray: function() {
        if (!this.hasRecords()) {
            return [];
        }

        var result = [];
        while (this.gr._next()) {
            // increase opcount
            this.increment();
            result.push(this.gr.sys_id + "");
        }
        return result;
    },
    // we create an increment method in case of future needs, we can differentiate between write/read/delete operations
    increment: function() {
        this.count++;
    },
    // this method returns the count of affected records, let it be queries, updates, deletes ... any operation to any record inside of this class
    affectedRecords: function() {
        return this.count;
    },
    type: 'GlideRecordExt'
};
