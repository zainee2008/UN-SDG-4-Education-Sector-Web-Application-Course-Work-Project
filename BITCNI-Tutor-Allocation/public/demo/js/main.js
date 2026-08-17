//-------------------------------------------- AHMAD'S SECTION------------------------------------------------------------
//Runs an sql query and returns a JSON where data is an array of objects. Try it out with console log

/**
 * The method below runs a given SQL query in the browser demo database and
 * returns the same JSON shape used by the original PHP connector.
 * @param {*} sql - A String value of the SQL query you'd like to execute
 * @returns - The JSON result returned by the browser database adapter
 */
const runSQL = async (sql) => {
    const resultJson = await window.executeDemoSQL(sql);
    if (!resultJson.success) {
        console.log("runSQL Error:", resultJson.error);
        return;
    }
    if (resultJson.data && resultJson.data.length > 0) {
        return resultJson;
    } else if (resultJson.data === undefined) {
        // Write queries return a success object so existing create/update pages
        // can provide accurate feedback.
        return resultJson;
    } else {
        console.log("runSQL Warning: Your SQL query didn't return any results.");
        console.log("This is expected for a SELECT with no matching rows.")
        console.log(`Query: ${sql}`);
        return;
    };
}


/**
 * displays a table for the given sql query - to be improved
 * @param {*} sql - A String value of the SQL query you'd like to execute
 * @param {*} tableID - The ID of the table you would like to populate
 */
const printTable = async (sql, tableID) => {
    const givenTable = document.querySelector(tableID);
    const result = await runSQL(sql);
    if (!givenTable) {
        console.log("Error there is no table");
        return;
    }
    if (!result) {
        console.log("Error there are no results to print a table with.")
        return;
    }
    givenTable.innerHTML = ""; //clear the table
    //Logic to populate header
    const headersRow = document.createElement("tr");
    const headerNames = Object.keys(result.data[0]);
    for (header of headerNames) {
        const tableHeader = document.createElement("th");
        tableHeader.textContent = header;
        headersRow.appendChild(tableHeader);
    }
    givenTable.appendChild(headersRow);
    //End of logic to populate header

    //The line below goes through every 
    for (list of result.data) {
        //console.log(list);
        const dataRow = document.createElement("tr");
        for (header of headerNames) {
            //console.log(list.header); WRONG because it gets literal header
            //console.log(list[header]); Allows header to be any assigned value instead of hardcoded
            const tableData = document.createElement("td");
            if (list[header]) {
                tableData.textContent = list[header];
            } else {
                tableData.textContent = "Not Provided";
            }
            dataRow.appendChild(tableData);
        }
        //Once data row has been populated then add it to table
        givenTable.appendChild(dataRow);
    }
};
/**
 * 
 * @returns - An Array of school details e.g [1,]
 */
const getArraySchoolSelection = () => {
    const schoolSelection = getSchoolSelection();
    if (schoolSelection == null) {
        console.log("Error there is no selected school.")
        return [];
    }
    let selectionArray = [];
    for (key of Object.keys(schoolSelection)) {
        selectionArray.push(schoolSelection[key]);
    }
    return selectionArray;
}

/**
 * Converts any object into an array for example {schoolID: '5', schoolName: 'Rasberry'} into
 * ['5','Rasberry'] in order of object keys
 * @param {*} object - The object you want converted into array format
 * @returns - an array of each object keys value
 */
const getArrayOfObject = (object) => {
    let objectArray = [];
    for (key of Object.keys(object)) {
        objectArray.push(object[key]);
    }
    return objectArray;
}




let selectedRow = {}; //The details of users selected row.
let schemaOfTables = {}; //an object consisting of table names as keys and their schema as an object value


const getSchemaOfTable = (tableName) => {
    if (schemaOfTables[tableName] === undefined) {
        console.log(`getSchemaOfTable Error: there is no schema for the table called '${tableName}'`);
        return;
    }
    return schemaOfTables[tableName];
};

/**
 * This method returns the object stored inside the selectedRow variable and then clears the variable.
 * @returns - selectedRow object 
 */
const getSelectedRow = () => {
    if (Object.keys(selectedRow).length > 0) { //If selectedRow has been populated
        selectedRowReference = selectedRow; //Store it in a temp value
        selectedRow = {}; //clear selected row for next selection;
        return selectedRowReference; //return the temp value
    } else { //If it hasn't been populated then print an error message
        console.log("getSelectedRow: Error (There are no selected rows)")
        return;
    }
};

//The list of valid data types for the setTableSchema method
const dataType = { int: "number", string: "text", date: "date", boolean: "checkbox", email: "email", telephone: "tel" }; //For enums specify the array of options

/**
 * Allows you to set a schema for a given table so that printAttributesRequestForm can present only the
 * appropriate attribute fields for users to provide in order to support crud operations.
 * The provided schema is also used to validate user input before any crud operation is ran.
 * @param {*} tableName - The name of the table that you would like to provide a schema for
 * @param {*} tableSchema - An object consisting of smaller nested objects for each field attribute specifying it's details
 */
const setTableSchema = async (tableName, tableSchema) => {
    const specifiedTable = schemaOfTables[tableName];
    for (key of Object.keys(tableSchema)) {
        if (tableSchema[key].type !== undefined) {
            if (!Array.isArray(tableSchema[key].type)) {
                let foundType = false;
                for (type of Object.keys(dataType)) {
                    if (tableSchema[key].type === dataType[type]) {
                        foundType = true;
                    }
                }
                if (!foundType) {
                    console.log(`setTableSchema Error: ${key}.type has the following unrecognised value: ${tableSchema[key].type}`);
                    return;
                }
            }
        } else {
            console.log(`setTableSchema Error: ${key}.type is undefined`);
            return;
        }
        if (tableSchema[key].required !== undefined) {
            if ((typeof tableSchema[key].required) !== "boolean") {
                console.log(`setTableSchema Error: ${key}.required must be boolean`);
                return;
            }
        } else {
            console.log(`setTableSchema Error: ${key}.required is undefined`);
            return;
        }
        if (tableSchema[key].allowUpdate !== undefined) {
            if ((typeof tableSchema[key].allowUpdate) !== "boolean") {
                console.log(`setTableSchema Error: ${key}.allowUpdate must be boolean`);
                return;
            }
        } else {
            console.log(`setTableSchema Error: ${key}.allowUpdate is undefined`);
            return;
        }
        if (tableSchema[key].allowCreation !== undefined) {
            if ((typeof tableSchema[key].allowCreation) !== "boolean") {
                console.log(`setTableSchema Error: ${key}.allowCreation must be boolean`);
                return;
            }
            if (tableSchema[key].maxLength !== undefined) {
                if ((typeof tableSchema[key].maxLength) !== "number") {
                    console.log(`setTableSchema Error: ${key}.maxLength must be of type number`);
                    return;
                } else if (tableSchema[key].maxLength < 1) {
                    console.log(`setTableSchema Error: ${key}.maxLength must be greater then 0`);
                }

            } else {
                console.log(`setTableSchema Error: ${key}.maxLength is undefined`);
                return;
            }
        } else {
            console.log(`setTableSchema Error: ${key}.allowCreation is undefined`);
            return;
        }
        if (tableSchema[key].required === true && tableSchema[key].allowCreation === false) {
            console.log(`setTableSchema Error: ${key}.allowCreation can't be false if attribute is required for creation`);
            console.log("If you intended to stop the creation of new rows then this is done through printCrudOptions method");
            return;
        }
        if (tableSchema[key].dependsOn !== undefined) {
            if (tableSchema[key].dependsOn.length < 1) {
                console.log(`setTableSchema Error: ${key}.dependsOn cannot be empty.`);
                console.log("If you do not wish to specify an FK dependency please dont define dependsOn");
                return;
            }
            dependsOnArray = tableSchema[key].dependsOn.split(".");
            if (dependsOnArray.length < 2) {
                console.log(`setTableSchema Error: ${key}.dependsOn doesn't mention the table of the dependent attribute`);
                return;
            }
            if (dependsOnArray[0].length === 0) {
                console.log(`setTableSchema Error: ${key}.dependsOn has an empty table reference`);
                return;
            }
            if (dependsOnArray[1].length === 0) {
                console.log(`setTableSchema Error: ${key}.dependsOn has an empty attribute reference`);
                return;
            }
            if (dependsOnArray[0] === tableName) {
                console.log(`setTableSchema Error: ${key}.dependsOn is for FK depedencies and thus cant be an attribute from the same table`);
                return;
            }
            let FKCheckQuery = await runSQL(`SELECT ${dependsOnArray[1]} FROM ${dependsOnArray[0]} LIMIT 1;`);
            if (FKCheckQuery === undefined) {
                tblCheckQuery = await runSQL(`SELECT * FROM ${dependsOnArray[0]}`);
                if (tblCheckQuery === undefined) {
                    console.log(`setTableSchema Error: ${key}.dependsOn references a non-existent 
                        table called "${dependsOnArray[0]}"`);
                    return;
                } else {
                    console.log(`setTableSchema Error: ${key}.dependsOn has the attribute '${dependsOnArray[1]}'
                        which doesn't exist in a table called '${dependsOnArray[0]}'.`);
                    return;
                }
            };

        }

    }
    schemaOfTables[tableName] = tableSchema
    console.log("Schema has been set successfully");
    console.log(schemaOfTables[tableName]);
}
let selectedSortValue = ""; //Changed to empty string because option assigned the string null not null itself
let sqlFilter = {};
let filterDetailElement = document.createElement("div");
//sqlTable consists of a virtual table names and their SQL so that they can be selected from
let sqlTable = {};
/**
* displays a table for the given sql query that is broken down into multiple pages depending on
the rowsPerPage parameter and the number of results.
*This method also provides filtering and sorting options for the presented table results
so that you may easily find what your looking for.
*
*Filtering options utilise datalists containing distinct values to present the user with possible matches
for the given filter value.
* @param {*} sql - A String value of the SQL query you'd like to execute
* @param {*} tableID - The ID of the table you would like to populate
*/
const printTablePages = async (sql, rowsPerPage, selectOption, divID) => {
    passedParameters['printTablePages'] = { sql: sql, rowsPerPage: rowsPerPage, selectOption: selectOption, divID: divID };
    const tdEmptyLabel = "Not Provided";
    const givenDiv = document.querySelector(divID);
    //const populatedTable = document.createElement("table");
    const previousButton = document.createElement("button");
    previousButton.innerHTML = "Previous Page";
    const nextButton = document.createElement("button");
    nextButton.innerHTML = "Next Page";
    let sqlSorted;
    if (selectedSortValue !== "" || Object.keys(sqlFilter).length > 0) {
        let sqlSortQuery = "";
        if (selectedSortValue !== "") {
            console.log("selectedSortValue was not empty it was " + selectedSortValue);
            const selectOptionsSplit = selectedSortValue.split("_");
            sqlSortQuery = "ORDER BY Query.`" + selectOptionsSplit[0] + "` " + selectOptionsSplit[1];
        }
        const noSemicolonSql = sql.replace(";", "");
        let sqlFilterQuery = "";
        for (let keyIndex = 0; keyIndex < Object.keys(sqlFilter).length; keyIndex++) {
            let key = Object.keys(sqlFilter)[keyIndex];
            if (sqlFilter[key] !== "") {
                sqlFilterQuery += "Query.`" + key + "` LIKE '%" + escapeSQL(sqlFilter[key]) + "%'";
                if (keyIndex < Object.keys(sqlFilter).length - 1) {
                    sqlFilterQuery += " AND ";
                } else {
                    sqlFilterQuery += " ";
                }
            }
        }
        if (sqlFilterQuery.length > 0) {
            sqlFilterQuery = "WHERE " + sqlFilterQuery;
        }
        sqlSorted = `SELECT * FROM (${noSemicolonSql}) AS Query ${sqlFilterQuery} ${sqlSortQuery};`;
    }
    console.log("Table running sql:");
    console.log(sqlSorted !== undefined ? sqlSorted : sql);
    const result = await runSQL(sqlSorted !== undefined ? sqlSorted : sql);
    console.log("Table sql result");
    console.log(result);
    if (!givenDiv) {
        console.log("Error there is no div box with your given ID");
        return;
    }
    if (!result) {
        console.log("Error there are no results to print a table with.")
        return;
    }
    //givenDiv.innerHTML = ""; //clear the table
    let tableDataPages = [];
    let tableDataPage = [];
    //Logic to populate header
    const headerNames = Object.keys(result.data[0]);
    tableDataPage.push(headerNames);

    //End of logic to populate header
    let rowsShorterThenLimit = true;
    //The line below goes through every 
    for (list of result.data) {
        //console.log(list);
        let dataRow = [];
        // creat a list instead
        for (header of headerNames) {
            if (list[header]) {
                dataRow.push(list[header]);
            } else {
                dataRow.push(tdEmptyLabel);
            }
            //push list
        }
        // if list divided by page cap > 1 
        // list divided by page cap = number of page capped pages

        //Once data row has been populated then add it to table
        if ((tableDataPage.length - 1) % rowsPerPage != 0 || tableDataPage.length == 1) {
            tableDataPage.push(dataRow);
            //what if table data page never reaches the count?
            rowsShorterThenLimit = true;
        } else {
            tableDataPages.push(tableDataPage);
            tableDataPage = [];
            tableDataPage.push(headerNames);
            tableDataPage.push(dataRow);
            rowsShorterThenLimit = false;
        }

    }
    if (rowsShorterThenLimit) {
        tableDataPages.push(tableDataPage);
    }

    //console.log(tableDataPages); // shows a matrix of arrays for each row thats in order of fields

    //Print current table page logic
    let tablePageNumber = 0;
    /**
     * This method creates a table element and all it's table rows, headers and data with
     * the results provided by the sql query
     * @returns - A table populated with the sql query results
     */
    const createTable = () => {
        const populatedTable = document.createElement("table");
        //Print table header
        const trHeader = document.createElement("tr");
        const headerDataRow = tableDataPages[tablePageNumber][0];
        for (let field = 0; field < headerDataRow.length; field++) {
            const th = document.createElement("th");
            th.textContent = headerDataRow[field];
            trHeader.appendChild(th);
        }
        //the line below adds an extra blank header for selection buttons 
        if (selectOption) {
            const selectHeader = document.createElement("th");
            selectHeader.textContent = "Page: " + tablePageNumber;
            trHeader.appendChild(selectHeader);
        }

        populatedTable.appendChild(trHeader);

        //Print table data without select option
        for (let row = 1; row < tableDataPages[tablePageNumber].length; row++) {
            const tr = document.createElement("tr");
            const currentDataRow = tableDataPages[tablePageNumber][row]
            for (let field = 0; field < currentDataRow.length; field++) {
                const td = document.createElement("td");
                td.textContent = currentDataRow[field];
                tr.appendChild(td);
            }
            if (selectOption) {
                const tdButtonField = document.createElement("td");
                const tdButton = document.createElement("button");
                tdButton.textContent = "Select";
                tdButton.addEventListener("click", () => {
                    for (let field = 0; field < currentDataRow.length; field++) {
                        selectedRow[headerDataRow[field]] = (currentDataRow[field] !== tdEmptyLabel ? currentDataRow[field] : '');
                    }
                });
                tdButtonField.appendChild(tdButton);
                tr.appendChild(tdButtonField);
            }
            populatedTable.appendChild(tr);
        }
        return populatedTable;
    };
    /**
     * This method generates filter options for all the attributes shown within the table by
     * presenting an input element for each attribute with datalists consisting of all the values
     * that are present in the table so that the user can type along and select the closest matching datalist 
     * option for a convenient user experience.
     * @param {*} filteringDiv - a div container of where you want the filter options form placed 
     * @returns - a Button element for displaying and hiding the filter options form
     */
    const filteringOptions = (filteringDiv) => {
        console.log("filtering options");
        const filteringButton = document.createElement("button");
        const filterForm = document.createElement("form");
        filteringButton.textContent = "Filter";
        let tableSchema = {};
        for (let header of headerNames) {
            tableSchema[header] = { type: dataType.string, required: false, allowUpdate: false, allowCreation: false, maxLength: 255 };
        }
        setTableSchema(divID + "Table", tableSchema);
        const header = document.createElement("h3");
        header.textContent = "Filter Options";
        const message = document.createElement("p");
        message.textContent = "Please provide the attributes that you'd want to filter table results by.";
        sqlTable[divID + "Table"] = sql;
        printAttributesRequestForm(header, message, {}, divID + "Table", operationTypes.filter, filterForm);
        let showForm = true;
        const formDisplayStyle = filterForm.style.display;
        filterForm.style.display = "none";
        filteringButton.addEventListener("click", () => {
            if (showForm === true) {
                filterForm.style.display = formDisplayStyle;
                showForm = false;
                filteringButton.classList.add("activeButton");
                filteringButton.textContent = "Hide Filter Options";
            } else if (showForm === false) {
                filterForm.style.display = "none";
                showForm = true;
                filteringButton.classList.remove("activeButton");
                filteringButton.textContent = "Filter";
            }


        });
        filteringDiv.appendChild(filterForm);
        filteringDiv.appendChild(filterDetailElement);
        return filteringButton;
    }

   /**
    * Generates an ascending and descending sorting option for each attribute present in the table
    * and places them inside a select element so that users can select an attribute to sort by and
    * have their table sorted by the chosen attribute whether its ascending or descending.
    * 
    * @returns - A div element containing a label and select element for sorting attributes
    */
    const sortingOptions = () => {
        console.log("sorting options");
        console.log(headerNames);
        const sortingDiv = document.createElement("div");
        const sortingLabel = document.createElement("label")
        sortingLabel.textContent = "Sort By ";
        sortingDiv.appendChild(sortingLabel);
        const selectOptions = document.createElement("select");
        const unsortedOption = document.createElement("option");
        unsortedOption.textContent = "Default";
        unsortedOption.value = "";
        selectOptions.appendChild(unsortedOption);
        for (let header of headerNames) {
            //Creates two options for given header to sort it ascending and descending
            const headerAscendingOption = document.createElement("option");
            const headerDescendingOption = document.createElement("option");
            //Uses template literals to label these options with the header name and action
            headerAscendingOption.textContent = `${header} ascending`;
            headerDescendingOption.textContent = `${header} descending`;
            //Selection value where its header name followed by order type where both can be split from the underscore
            headerAscendingOption.value = `${header}_ASC`;
            headerDescendingOption.value = `${header}_DESC`;
            //Append to the options to the select element
            selectOptions.appendChild(headerAscendingOption);
            selectOptions.appendChild(headerDescendingOption);
        }
        selectOptions.value = selectedSortValue;


        selectOptions.addEventListener("change", () => {
            selectedSortValue = selectOptions.value;
            console.log("Calling self with sql: " + sql)
            printTablePages(sql, rowsPerPage, selectOption, divID);
            // if(selectedSortValue !== null){
            // const selectOptionsSplit = selectOptions.value.split("_");
            // console.log(selectOptions.value);
            // const noSemicolonSql = sql.replace(";", "");
            // const orderSql = "SELECT * FROM (" + noSemicolonSql + ") AS Query ORDER BY Query.`" + selectOptionsSplit[0] + "` " + selectOptionsSplit[1];
            // printTablePages(orderSql, rowsPerPage, selectOption, divID);
            // }
        });
        sortingDiv.appendChild(selectOptions);
        return sortingDiv;
    }
    //Display formatting section

    const populateDiv = () => {
        //Adds the completed table to the div box
        givenDiv.innerHTML = ""; //clear the table
        const formatOptionsDiv = document.createElement("div");
        formatOptionsDiv.id = "formatOptionsDiv";
        const filteringDiv = document.createElement("div");
        givenDiv.appendChild(filteringDiv); //Appends a div for filter options and to display chosen filters
        formatOptionsDiv.appendChild(filteringOptions(filteringDiv)); //Appends filter button
        formatOptionsDiv.appendChild(sortingOptions()); //Appends sorting options
        givenDiv.appendChild(formatOptionsDiv);
        givenDiv.appendChild(createTable());
        const pageNavDiv = document.createElement("div");
        pageNavDiv.id = "pageNavDiv";
        if (tablePageNumber > 0) {
            pageNavDiv.appendChild(previousButton);
        }
        if (tablePageNumber < tableDataPages.length - 1) {
            pageNavDiv.appendChild(nextButton);
        }
        givenDiv.appendChild(pageNavDiv);
    };
    populateDiv();

    previousButton.addEventListener("click", () => {
        tablePageNumber--;
        populateDiv();
    });

    nextButton.addEventListener("click", () => {
        tablePageNumber++;
        populateDiv();
    })



    //end of display formatting section

};

//The line below is an enumerator for selecting operation types for the printAttributesRequestForm method
//It ensures that valid operations are selected by developers.
const operationTypes = { update: "update", create: "create", filter: "filter" };

/**
 * 
 * @param {*} header - A header element for the form you'd like to generate
 * @param {*} message - A p element describing what your form does 
 * @param {*} fieldAlias - An object of attribute aliases as the key and their original name as the value 
 * @param {*} tableName - The table that you intend to perform operations on.
 * @param {*} operation - The type of operation you would like to execute on submit 
 * @param {*} formID - The ID of the div container you'd like the form printed to.
 * @returns - returns undefined
 */
const printAttributesRequestForm = async (header, message, fieldAlias, tableName, operation, formID) => {
    if (formID === undefined) {
        console.log("printAttributesRequestForm Error: You have not specified the formID parameter \n" +
            "which is the ID of the form element that you populated.")
        return;
    }
    formID.innerHTML = "";
    formID.appendChild(header);
    formID.appendChild(document.createElement("br"));
    formID.appendChild(message);
    formID.appendChild(document.createElement("br"));
    if (tableName === undefined || tableName.length < 1) {
        console.log("printAttributesRequestForm Error: you have not provided the tableName parameter");
        return;
    } else if ((typeof tableName) !== "string") {
        console.log("printAttributesRequestForm Error: tableName has to be a string");
        return;
    }
    let validOperation = false;
    for (key of Object.keys(operationTypes)) {
        if (operationTypes[key] === operation) {
            validOperation = true;
            break;
        }
    }
    if (validOperation === false) {
        console.log("printAttributesRequestForm Error: operation paramter has a value that's not from opertationTypes");
        return;
    }

    const tableSchema = getSchemaOfTable(tableName);
    if (tableSchema === undefined) {
        console.log("printAttributesRequestForm Error: the provided table doesn't have a schema set for it");
        return;
    }
    for (attribute of Object.keys(tableSchema)) {
        const askAttribute = (tableSchema[attribute].allowUpdate !== false && operation === operationTypes.update) ||
            (tableSchema[attribute].allowCreation !== false && operation === operationTypes.create);
        if (askAttribute || operation === operationTypes.filter) {
            let attributeID = "";
            for (char of attribute) {
                attributeID += char.replace(" ", "");
            }
            const formRowDiv = document.createElement("div");
            formRowDiv.className = "form-row";
            const label = document.createElement("label");
            const aliasKey = Object.keys(fieldAlias)[Object.values(fieldAlias).indexOf(attribute)] //Undefined if not found
            label.textContent = (aliasKey !== undefined ? aliasKey : attribute);
            let input;
            if (!Array.isArray(tableSchema[attribute].type)) {
                input = document.createElement("input");
                console.log("Type for " + attribute + " Is " + tableSchema[attribute].type);
                input.type = tableSchema[attribute].type;

                console.log(attribute + "Has max length of " + tableSchema[attribute].maxLength);
                if (input.type === "number") {
                    input.max = (10 ** tableSchema[attribute].maxLength) - 1;
                    input.min = 0;
                    console.log(input.max + "Is the max for " + attribute);
                } else if (input.type !== "checkbox") {
                    input.maxLength = tableSchema[attribute].maxLength;
                    if (operation === operationTypes.filter) {
                        list = document.createElement("datalist");
                        list.id = attributeID + "Options";
                        input.setAttribute("list", attributeID + "Options");
                        console.log("Running query:");
                        let sql = sqlTable[tableName].replace(";", "");
                        console.log("SELECT DISTINCT`" + attribute + "` FROM (" + sql + ") AS Query;");
                        optionsResult = (await runSQL("SELECT DISTINCT `" + attribute + "` FROM (" + sql + ") AS Query;"));
                        if (optionsResult !== undefined && optionsResult.data !== undefined) {
                            for (option of optionsResult.data) {
                                const optionElement = document.createElement("option");
                                optionElement.value = option[attribute];
                                list.appendChild(optionElement);
                            }
                            formRowDiv.appendChild(list);
                        }
                    }

                }
            } else {
                input = document.createElement("select");
                for (constant of tableSchema[attribute].type) {
                    const option = document.createElement("option");
                    option.value = constant;
                    option.textContent = constant;
                    input.appendChild(option);
                };
            }
            if (tableAttributesValue[attribute] !== undefined && operation === operationTypes.update) {
                input.value = tableAttributesValue[attribute];
            } else {
                console.log("tableAttributesValue[" + attribute + "] is undefined");
                console.log("tableAttributesValue object");
                console.log(tableAttributesValue);
            }
            input.required = tableSchema[attribute].required;
            input.id = attributeID;
            label.for = input.id;
            label.id = attributeID + "Label";
            formRowDiv.appendChild(label);
            formRowDiv.appendChild(document.createElement("br"));
            formRowDiv.appendChild(input);
            formID.appendChild(formRowDiv);
        };
    }
    const submitButton = document.createElement("button");
    submitButton.textContent = "submit";
    //type submit doesn't need to be declared its default inside forms type button also exists
    formID.addEventListener("submit", async () => {
        event.preventDefault();
        feedbackElement.innerHTML = "";
        //Function to revert all labels that were given the class incorrect back to normal
        for (element of document.querySelectorAll(".incorrect")) {
            element.classList.remove("incorrect");
            element.style = "";
            element.title = "";
        }
        userData = {};
        let valid = true;
        for (attribute of Object.keys(tableSchema)) {
            const requestedAttribute = (tableSchema[attribute].allowUpdate !== false && operation === operationTypes.update) ||
                (tableSchema[attribute].allowCreation !== false && operation === operationTypes.create);
            if (requestedAttribute || operation === operationTypes.filter) {
                //unimplemented also add error msg div for validation
                aliasKey = Object.keys(fieldAlias)[(Object.values(fieldAlias)).indexOf(attribute)];
                attributeName = (aliasKey !== undefined ? aliasKey : attribute);
                let attributeID = "";
                for (char of attribute) {
                    attributeID += char.replace(" ", "");
                }
                const inputValue = document.querySelector("#" + attributeID).value.trim();
                if (operationTypes.create && tableSchema[attribute].required === true && inputValue === "") {
                    (`Error: ${attributeName} is required for creation.`, false);
                    valid = false;
                    break;
                }
                if (tableSchema[attribute].type === dataType.telephone) {
                    for (char of "" + inputValue) {
                        if ((char < "0" || char > "9") && char !== " " && char !== "+") {
                            console.log("Phone number error");
                            document.querySelector("#" + attribute + "Label").classList.add("incorrect");
                            document.querySelector("#" + attribute + "Label").style = "color: red; font-weight: bold;";
                            document.querySelector("#" + attribute + "Label").title = "telephone numbers can't have non numeric characters";
                            setFeedbackMessage(`Error: ${attributeName} has to be a telephone number ` +
                                `and it can't have non numeric characters.`, false);
                            valid = false;
                            break;
                        }
                    }
                    if (valid === false) {
                        break;
                    }
                }
                if ((inputValue !== tableAttributesValue[attribute] && operation === operationTypes.update) || operation === operationTypes.create || operation === operationTypes.filter) {
                    if (inputValue !== "") {
                        //Logic for fk dependencies needs to be implemented here
                        const dependsOn = tableSchema[attribute].dependsOn;
                        if (dependsOn !== undefined) {
                            console.log(attribute + " has a dependency validating said dependency value");
                            dependsOnSplit = dependsOn.split(".");
                            console.log(`Runsql for checking depends on table ${dependsOn} for given attribute ${attribute}`);
                            const query = `SELECT * FROM ${dependsOnSplit[0]} WHERE ${dependsOnSplit[1]} = '${escapeSQL(inputValue)}';`;
                            console.log("Query: " + query);
                            console.log((await runSQL(query)));
                            console.log("if that returned undefined then error else proceed");
                            if ((await runSQL(query) === undefined)) {
                                const errorMessage = `${attributeName} is a Foreign Key and it's value must be from the table called "${dependsOnSplit[0]}"`
                                setFeedbackMessage(`Error: ${errorMessage}`, false);
                                document.querySelector("#" + attribute + "Label").classList.add("incorrect");
                                document.querySelector("#" + attribute + "Label").title = errorMessage;
                                valid = false;
                                break;
                            } else {
                                userData[attribute] = "" + inputValue;
                            }
                        } else {
                            userData[attribute] = "" + inputValue;
                        }
                    } else if (tableSchema[attribute].required === false && operation !== operationTypes.filter) {
                        userData[attribute] = "NULL";
                    }
                } else {
                    if (inputValue !== tableAttributesValue[attribute]) {
                        console.log("No change made to " + attribute + "Because it was same value");
                    }
                }
            };

        }
        if (valid === true) {
            console.log("submit obj");
            console.log(userData);
            console.log(tableName);
            if (operation === operationTypes.create) {
                if (Object.keys(userData).length > 0) {
                    createSQLRow(tableName, userData);
                } else {
                    setFeedbackMessage("No valid data has been provided in order for a row to be created.", false);
                }
            } else if (operation === operationTypes.update) {
                if (Object.keys(userData).length > 0) {
                    updateSQLRow(tableName, userData);
                } else {
                    setFeedbackMessage("No new attributes have been provided in order for the selected row to be updated.", false);
                }
            } else if (operation === operationTypes.filter) {
                filterDetailElement.innerHTML = "";
                filterDetailElement.id = "filterDetailElement";

                let filterHeader = document.createElement("h3");
                filterHeader.textContent = "Results Filtered by: ";
                if (Object.keys(userData).length > 0) {
                    filterDetailElement.appendChild(filterHeader);
                    filterDetailElement.appendChild(createObjectDl(userData));
                }
                sqlFilter = userData;
                refreshPage();
            }
        }
    });
    formID.appendChild(submitButton);
    //feedBackElement will be used to display the success of a selected operation
};

/**
 * updates an sql row from the given table name using the provided object's key as attribute
 * names and it's values as the value you'd like to set
 * @param {} tableName - The table where you would like to perform an Update
 * @param {*} object - The object containing the attributes you'd like to update
 */
const updateSQLRow = async (tableName, object) => {
    console.log("passed object:");
    console.log(object);
    let sqlQuery = `UPDATE ${tableName} SET `;
    for (let keyIndex = 0; keyIndex < Object.keys(object).length; keyIndex++) {
        const key = Object.keys(object)[keyIndex];
        //tableAttributesValue[key] = object[key];
        console.log("Selected table attributes");
        console.log(tableAttributesValue);
        sqlQuery += `${escapeSQL("" + key)} = '${escapeSQL("" + object[key])}'`;
        if (keyIndex < Object.keys(object).length - 1) {
            sqlQuery += ", ";
        } else {
            sqlQuery += " WHERE ";
            for (let keyIndex = 0; keyIndex < Object.keys(tableAttributesValue).length; keyIndex++) {
                const key = Object.keys(tableAttributesValue)[keyIndex];
                sqlQuery += `${escapeSQL("" + key)} = '${escapeSQL("" + tableAttributesValue[key])}'`;
                if (keyIndex < Object.keys(tableAttributesValue).length - 1) {
                    sqlQuery += ' AND '
                } else {
                    sqlQuery += ";";
                }
            }
        }
        console.log("Your update query");
        console.log(sqlQuery);

    }
    const updateSuccess = await runWriteSQL(sqlQuery);
        if (updateSuccess === true) {
            for (const key of Object.keys(object)) {
                tableAttributesValue[key] = object[key];
            }
            console.log("Row updated successfully now refreshing");
            filterDetailElement.innerHTML = "";
            sqlFilter = {};
            setFeedbackMessage("Row Updated successfully", true);
            refreshPage();
        }
        else if (updateSuccess === false) {
            setFeedbackMessage("Error: the SQL Update Query has failed and no changes have been made.", false);
        }
}

/**
 * This method refreshes the printTablePages method and the printCrudOptions method by 
 * calling them again with the previously passed parameters that have been updated to reflect any changes
 * made to them during operations such as UPDATE.
 * 
 * This method is useful when it comes to ensuring data consistency especially aftet the user performs
 * an operation as this would lead to our old tabe and selection being inaccurate. This method eleminates that
 * inaccuracy by calling printTablePages and printCrudOptions again so that it can be based on the latest data
 * collected from the database
 */
const refreshPage = () => {
    console.log("refresh page called");
    console.log(passedParameters);
    if (passedParameters['printTablePages'] !== undefined) {
        let parameters = passedParameters['printTablePages'];
        printTablePages(parameters.sql, parameters.rowsPerPage, parameters.selectOption, parameters.divID);
    } else {
        console.log("Print table pages has no params");
    }
    if (passedParameters['printCrudOptions'] !== undefined) {
        let parameters = passedParameters['printCrudOptions'];
        console.log("Refresh page")
        console.log("Old parameters");
        console.log(parameters.selectionObject);
        console.log("New parameters")
        console.log(tableAttributesValue);
        for (let keyIndex = 0; keyIndex < Object.keys(tableAttributesValue).length; keyIndex++) {
            key = Object.keys(tableAttributesValue)[keyIndex];
            console.log(key + " from tableAttributes value");
            aliasKeyIndex = Object.values(parameters.fieldAlias).indexOf(key);
            if (aliasKeyIndex !== undefined) {
                aliasKey = Object.keys(parameters.fieldAlias)[aliasKeyIndex];
                console.log("aliasKey is defined");
                console.log("parameters.selectionObject[" + aliasKey + "] = tableAttributesValue[" + key + "]");
                parameters.selectionObject[aliasKey] = tableAttributesValue[key];
            } else {
                console.log("Alias key not found assigning key to key");
                parameters.selectionObject[key] = tableAttributesValue[key];
            }
        }
        console.log("Fixed selection object for crud options");
        console.log(parameters.selectionObject);
        printCrudOptions(parameters.selectionObject, parameters.fieldAlias, parameters.selectionTable, parameters.label, parameters.create, parameters.update, parameters.del, parameters.divID);
        const prevFeedbackParam = passedParameters['setFeedbackMessage'];
        setFeedbackMessage(prevFeedbackParam.message, prevFeedbackParam.success);
        console.log("Resurrected feedback: ")
        console.log(prevFeedbackParam);

    } else {
        console.log("Print crud options has no params");
    }

}

/**
 * This method performs an insert operation on the table with the provided table name and adds
 * the attributes
 * @param {*} tableName - The table where you would like create rows
 * @param {*} object - an Object containing the attributes and their values that you'd like to create a row with.
 */
const createSQLRow = async (tableName, object) => {
    console.log("Create sql row called");
    let sqlQuery = `INSERT INTO ${tableName} (`;
    let sqlQueryValues = `VALUES (`
    for (let keyIndex = 0; keyIndex < Object.keys(object).length; keyIndex++) {
        const key = Object.keys(object)[keyIndex];
        const value = object[key];
        sqlQuery += `${escapeSQL("" + key)}`;
        sqlQueryValues += `'${escapeSQL("" + value)}'`;
        if (keyIndex < Object.keys(object).length - 1) {
            sqlQuery += ",";
            sqlQueryValues += ",";
        } else {
            sqlQuery += ") ";
            sqlQueryValues += ");";
            sqlQuery += sqlQueryValues;

        }
    }
    const createSuccess = await runWriteSQL(sqlQuery);
    if (createSuccess === true) {
        console.log("Row created successfully now refreshing");
        filterDetailElement.innerHTML = "";
        sqlFilter = {};
        setFeedbackMessage("Row Created successfully", true);
        refreshPage();
    } else if (createSuccess === false) {
        setFeedbackMessage("Error: the SQL Create Query has failed and no new rows have been made.", false);
    }

}


const createObjectDl = (object) => {
    if (object === undefined) {
        console.log("createObjectDl Error: passed object is undefined");
        return;
    }
    const dl = document.createElement("dl");
    for (key of Object.keys(object)) {
        const dt = document.createElement("dt");
        dt.textContent = key;
        const dd = document.createElement("dd");
        dd.textContent = (object[key].length > 0 ? object[key] : "Not Provided");
        dl.appendChild(dt);
        dl.appendChild(dd);
    }
    return dl;
}


//feedBackElement will be used to display the success or failure of an operation
const feedbackElement = document.createElement("p");
feedbackElement.id = "feedbackElement";

const setFeedbackMessage = (message, success) => {
    if (success === true) {
        feedbackElement.classList.remove("errorMessage")
        feedbackElement.classList.add("feedbackMessage");
    } else if (success === false) {
        feedbackElement.classList.remove("feedbackMessage");
        feedbackElement.classList.add("errorMessage");
    } else {
        console.log("setFeedbackMessage Error: success parameter has to be type boolean");
        return;
    }
    passedParameters['setFeedbackMessage'] = { message: message, success: success };
    feedbackElement.textContent = "" + message;
}
//A complete object of attributes and values for the users selected row 
let tableAttributesValue = {};

let passedParameters = {};


/**
 * This method will print a CRUD bar into a div box for CRUD operations on given table.
 * Our table fulfills read functionality so this method will implement the other operations of CRUD
 * which are the following.
 * 
 * create new rows of data for a given table based on the users input for fields stated in the create parameter
 * display a delete button to delete the selected row that has fields matching selectionObject
 * display a form containing fields of  
 * @param {*} selectionObject - the selected object for Update and Delete operations
 * @param {*} fieldAlias - an Object of Aliases and their assigned fields e.g {'School Name': schoolName}
 * @param {*} selectionTable - a String table name of where your selected object is from
 * @param {*} label - a String label of what your selection is i.e School or Request
 * @param {*} create - an Array containing the fields required to create a row
 * @param {*} update - an Array containing the updatable fields
 * @param {*} del  - A boolean value on whether you want data rows deletable
 * @param {*} divID - The div box to present these options
 */
const printCrudOptions = async (selectionObject, fieldAlias, selectionTable, label, create, update, del, divID) => {
    passedParameters['printCrudOptions'] = {
        selectionObject: {}, fieldAlias: fieldAlias, selectionTable: selectionTable,
        label: label, create: create, update: update, del: del, divID: divID
    };
    for (key of Object.keys(selectionObject)) {
        passedParameters['printCrudOptions']['selectionObject'][key] = selectionObject[key];
    }

    //rename objects in selectionObject based on alias to the actual sql field names
    if (fieldAlias != null && Object.keys(fieldAlias).length > 0) {
        for (aliasKey of Object.keys(fieldAlias)) {
            //console.log('field alias name');
            //console.log(aliasKey);
            //console.log("Actual field name")
            //console.log(fieldAlias[aliasKey]);
            if (selectionObject[aliasKey] !== undefined) {
                selectionObject[fieldAlias[aliasKey]] = selectionObject[aliasKey]
                delete selectionObject[aliasKey];
            }
        }

        console.log("Line 772 selectionObject renamed")
        console.log(selectionObject);
    } else {
        console.log("");
        console.log("printCrudOptions: field alias objects not provided");
        console.log("Skipping alias field rename into sql field names")
    }

    //Filter out attributes not from the selection table schema
    const selectionTableSchema = getSchemaOfTable(selectionTable);
    let selectedTableAttributes = {};
    for (const key of Object.keys(selectionObject)) {
        if (selectionTableSchema[key] !== undefined) {
            selectedTableAttributes[key] = selectionObject[key];
        }
    }
    console.log("Selection elements from given table ");
    console.log(selectedTableAttributes);
    //end of selectObject renaming
    const givenDiv = document.querySelector(divID);
    givenDiv.innerHTML = "";
    const header = document.createElement("h3");
    header.innerText = `Chosen ${label}`;

    //the two lines below creates a create button and labels it 
    const createButton = document.createElement("button");
    createButton.textContent = `Create ${label}`;

    //the two lines below creates a update button and labels it
    const updateButton = document.createElement("button");
    updateButton.textContent = `Update ${label}`;


    //optionsDiv will contain our CRUD buttons
    const optionsDiv = document.createElement("div");
    optionsDiv.id = "optionsDiv";

    //formElement will be used to display a form for detail gathering
    const formElement = document.createElement("form");


    if (selectionObject !== undefined) {
        let tblSelectionQuery = `SELECT * FROM ${selectionTable} WHERE `;
        for (let keyIndex = 0; keyIndex < Object.keys(selectedTableAttributes).length; keyIndex++) {
            const key = Object.keys(selectedTableAttributes)[keyIndex];
            tblSelectionQuery += `${escapeSQL("" + key)} = '${escapeSQL("" + selectedTableAttributes[key])}'`;
            if (keyIndex < Object.keys(selectedTableAttributes).length - 1) {
                tblSelectionQuery += ' AND '
            } else {
                tblSelectionQuery += ";";
            }
        }
        console.log(tblSelectionQuery);
        console.log((await runSQL(tblSelectionQuery)).data[0]);
        const tblSelectionQueryResult = (await runSQL(tblSelectionQuery)).data[0];
        for (key of Object.keys(tblSelectionQueryResult)) {
            tableAttributesValue[key] = tblSelectionQueryResult[key];
            fieldAliasIndex = Object.values(fieldAlias).indexOf(key);
            console.log(tblSelectionQueryResult[key]);
            console.log("field Alias index" + fieldAliasIndex);
            if (fieldAliasIndex !== undefined) {
                tblSelectionQueryResult[Object.keys(fieldAlias)[fieldAliasIndex]] = tblSelectionQueryResult[key];
                delete tblSelectionQueryResult[key];
            }
        }
        tblSelectionDiv = document.createElement("div");
        tblSelectionDiv.appendChild(header);
        tblSelectiondl = createObjectDl(tblSelectionQueryResult);
        tblSelectionDiv.appendChild(tblSelectiondl);
        givenDiv.appendChild(tblSelectionDiv);
        givenDiv.appendChild(optionsDiv);
    };

    /**This method clears the buttons for CRUD operations that require a selection and can be useful
     * when a given selection might no longer be there for example if the user has chosen to delete it.
     */
    const clearSelectionElements = () => {
        tblSelectionDiv.innerHTML = "";
        optionsDiv.innerHTML = "";
        formElement.innerHTML = "";
        //script to recreate the create button here
        optionsDiv.appendChild(createButton);
    }






    if (del === true) {
        let delQuery = `DELETE FROM ${selectionTable} WHERE`;
        //where all object parameter matches
        const allobjectKeys = Object.keys(selectionObject);
        const objectKeys = [];

        for(key of allobjectKeys){
            if(selectionTableSchema[key] !== undefined){
                objectKeys.push(key);
            }
        }
        for (let keyIndex = 0; keyIndex < objectKeys.length; keyIndex++) {
                console.log(objectKeys[keyIndex]);
                delQuery += " `" + objectKeys[keyIndex] + "` = '" + escapeSQL("" + selectionObject[objectKeys[keyIndex]]) + "'";
                if (keyIndex < objectKeys.length - 1) {
                    delQuery += " AND";
                }
        }
        delQuery += ";";
        const delButton = document.createElement("button");
        delButton.textContent = `Delete ${label}`;
        delButton.addEventListener("click", async () => {
            feedbackElement.innerHTML = "";
            console.log("Delete is risky needs confirm")
            if (confirm('Are you sure you want to delete your chosen row?')) {
                console.log("Delete functionality is disabled to protect database integrity");
                console.log(delQuery);
                console.log("result");
                if ((await runWriteSQL(delQuery)) === true) {
                    clearSelectionElements();
                    feedbackElement.textContent = `Selected ${label} has been deleted.`;
                    feedbackElement.classList.remove("errorMessage");
                    feedbackElement.classList.add("feedbackMessage");
                } else {
                    feedbackElement.textContent = `Error: Database failed to delete ${label}.`;
                    feedbackElement.classList.remove("feedbackMessage");
                    feedbackElement.classList.add("errorMessage");
                }

            };
        });
        optionsDiv.appendChild(delButton);
        givenDiv.appendChild(feedbackElement);
    } else {
        if ((typeof del) !== "boolean") {
            console.log("printCrudOptions Error: update parameter has to be boolean");
            return;
        }
        console.log("");
        console.log(`printCrudOptions: del has been set to ${del} so delete option will not provided.`);

    }
    if (create === true) {
        //INSERT INTO selectionTable (providedfield providedfield etc)
        //let insertQuery = `INSERT INTO ${selectionTable} (${create.toString().replace("[", "(").replace("]", ")")}) VALUES `;
        //console.log(insertQuery);
        const header = document.createElement("h2");
        header.textContent = `Create ${label} Form`;
        const message = document.createElement("p");
        message.textContent = `Please provide and submit the following fields required to create a ${label}`;
        optionsDiv.appendChild(createButton);

        createButton.addEventListener("click", () => {
            feedbackElement.innerHTML = "";
            printAttributesRequestForm(header, message, fieldAlias, selectionTable, operationTypes.create, formElement);
            givenDiv.appendChild(formElement);;
        });
        //     formDiv.innerHTML = "";
        //     formDiv.appendChild(header);
        //     formDiv.appendChild(document.createElement("br"));
        //     formDiv.appendChild(message);
        //     formDiv.appendChild(document.createElement("br"));

        //     const tableSchema = getSchemaOfTable(selectionTable)
        //     for (attribute of Object.keys(tableSchema)) {
        //         const formRowDiv = document.createElement("div");
        //         formRowDiv.className = "form-row";
        //         const label = document.createElement("label");
        //         const aliasKey = Object.keys(fieldAlias)[Object.values(fieldAlias).indexOf(attribute)] //Undefined if not found
        //         label.textContent = (aliasKey !== undefined ? aliasKey : attribute);
        //         const input = document.createElement("input");
        //         console.log("Type for "+attribute+" Is "+tableSchema[attribute].type);
        //         input.type = tableSchema[attribute].type;
        //         console.log(attribute+"Has max length of "+tableSchema[attribute].maxLength);
        //         if(input.type === "number"){
        //             input.max = (10 ** tableSchema[attribute].maxLength)-1;
        //             input.min = 0;
        //             console.log(input.max +"Is the max for "+attribute);
        //         } else if(input.type !== "checkbox"){
        //             input.maxLength = tableSchema[attribute].maxLength;
        //         }
        //         input.id = attribute;
        //         label.for = input.id;
        //         formRowDiv.appendChild(label);
        //         formRowDiv.appendChild(document.createElement("br"));
        //         formRowDiv.appendChild(input);
        //         formDiv.appendChild(formRowDiv);
        //     }
        //     const submitButton = document.createElement("button");
        //     submitButton.textContent = "submit";
        //     submitButton.addEventListener("click", () => {
        //         userData = {};
        //         for (attribute of create) {
        //             //unimplemented
        //             userData[attribute] = document.querySelector("#" + attribute).value;
        //         }
        //         console.log(userData);
        //     })
        //     formDiv.appendChild(submitButton);
        //     givenDiv.appendChild(formDiv);
        // });



    } else {
        if ((typeof create) !== "boolean") {
            console.log("printCrudOptions Error: create parameter has to be boolean");
            return;
        }
        console.log("");
        console.log(`printCrudOptions: create has been set to ${create} so create option will not provided.`);
    }
    if (update === true) {
        //UPDATE selectionTable SET providedfield = userinput providedfield=userinput WHERE selectionObject match
        const header = document.createElement("h2");
        header.textContent = `Update ${label} Form`;
        const message = document.createElement("p");
        message.textContent = `Please provide and submit the following fields required to update a ${label}`;
        optionsDiv.appendChild(updateButton);

        updateButton.addEventListener("click", () => {
            feedbackElement.innerHTML = "";
            printAttributesRequestForm(header, message, fieldAlias, selectionTable, operationTypes.update, formElement);
            givenDiv.appendChild(formElement);;
        });

    } else {
        if ((typeof update) !== "boolean") {
            console.log("printCrudOptions Error: update parameter has to be boolean");
            return;
        }
        console.log("");
        console.log(`printCrudOptions: update has been set to ${update} so update option will not provided.`);
    }

};



//-----------------------------------------END OF AHMAD'S SECTION---------------------------------------------------------

//---------------------------------------------MATTHEW'S SECTION----------------------------------------------------------

// ------ NOTE ------ // 

/* It may be possible to consolidate all 'save...Selection' and 'get...Selection' functions into one function, as they all deal with saving
and getting an object paired with a specific key for now, will be better able to determine this is the case once all of the pages are completed
and functional - Matt */

// ------ END NOTE ------ // 

// saveSchoolSelection function shall be used to save a sleected school at the schools side home page to pass on to other pages 
// will take a school object and save it as a 'key-value' pair in session storage. 
// School object will need to be stringified before it can be stored in session storage 
// could maybe use similar functions to store other user selections????
const saveSchoolSelection = (school) => {
    sessionStorage.setItem("selectedSchool", JSON.stringify(school));
};

// getSchoolSelection function shall be used to to retrieve a school object that has been saved using the saveSchoolSelection function.
// will convert the stringified school object back into a JavaScript object before returning it.
const getSchoolSelection = () => {
    const retrievedSchool = sessionStorage.getItem("selectedSchool");  // retrieve stringified school paired with 'selectedSchool' key from session storage

    if (retrievedSchool === null) { // if there is no school saved in session storage, return null
        return null;
    }
    return JSON.parse(retrievedSchool); // else, parse school back into JS object and return
};

/*Note from Ahmad regarding saveRequest and getRequest
Your current request methods have a significant problem when multiple team members implement it
for example if im saving a tutor request on my page and some elses page is getting a request expecting a 
school then it's going to break.  

I suggest that you allow your method to take in a custom storage key input from the user when being called
for example saveRequestSelection("selectedTutor") and getRequestSelection("selectedTutor")

this would avoid conflicts across pages where we have different interpretations of the saved content and
it would allow us to state what saved content where expecting i.e a school, a tutor, etc

please leave this comment to signify group participation*/

const saveEditRequestSelection = (request) => {
    sessionStorage.setItem("selectedRequest", JSON.stringify(request));
};

// getRequestSelection function shall be used to to retrieve a request object that has been saved using the saveRequestSelection function.
// will convert the stringified request object back into a JavaScript object before returning it.
const getEditRequestSelection = () => { 
    const retrievedRequest = sessionStorage.getItem("selectedRequest");  // retrieve stringified request paired with 'selectedRequest' key from session storage

    if (retrievedRequest === null) { // if there is no request saved in session storage, return null
        return null;
    }
    

        // NOTE: the following test request object is currently being returned for testing purposes only, to be removed once 'my_requests.html' page is complete and functional 
        // getRequestSelection function should return null if there is no request saved, once 'my_requests.html' page is complete and functional
        // const selectedRequest = {
        //     "requestID": 1,
        //     "requestSubject": "Mathematics",
        //     "requestEduLevel": "Secondary",
        //     "requestDescription": "Extra mathematics sessions requested for fractions...",
        //     "requestOpenDate": "2024-05-01",
        // };

        // return selectedRequest; // for testing purposes only, to be removed once 'my_requests.html' page is complete and functional 

    return JSON.parse(retrievedRequest); // else, parse request back into JS object and return
}; 


const validSubjects = new Set(["English", "Mathematics", "Science", "Biology", "Chemistry", "Physics", "History", "Geography", "Religious Studies", "ICT", "Art and Design", "Music", "Physical Education"]); // set containing valid subjects 
const validEduLevels = new Set(["Primary", "Secondary", "Tertiary", "Other"]); // set containing valid education levels

const validateRequestEdit = (updatedRequest) => {
    if (!updatedRequest || typeof updatedRequest !== "object") {
        return "Request details are required.";
    }

    // Clean up and convert values first so the checks below are easier to write.
    const requestSubjectName = typeof updatedRequest.requestSubjectName === "string" ? updatedRequest.requestSubjectName.trim() : ""; // trim whitespace from requestSubject
    const requestEduLevel = typeof updatedRequest.requestEduLevel === "string" ? updatedRequest.requestEduLevel.trim() : ""; // trim whitespace from requestEduLevel
    const requestDescription = typeof updatedRequest.requestDescription === "string" ? updatedRequest.requestDescription.trim() : ""; // trim whitespace from requestDescription

    if (!requestSubjectName) {
        return "Request subject is required."; // message if requestSubject is empty
    } else if (!validSubjects.has(requestSubjectName)) {
        // message if requestSubject is not in validSubjects set
        return "Request subject must be one of the following: " + Array.from(validSubjects).join(", ") + "."; // print all valid subjects in set
    }

    if (!requestEduLevel) {
        return "Request education  is required."; // message if requestEduLevel is empty
    } else if (!validEduLevels.has(requestEduLevel)) {
        // message if requestEduLevel is not in validEduLevels set
        return "Request education level must be one of the following: " + Array.from(validEduLevels).join(", ") + "."; // prints all valid education levels in set
    }

    if (!requestDescription) {
        return "Request description is required."; // message if requestDescription is empty
    } else if (requestDescription.length > 256) {
        return "Request description must be 256 characters or fewer (including whitespace)."; // message if requestDescription is too long
    }

    return null; // if all checks are passed, return null to indicate no errors

};


//-----------------------------------------END OF MATTHEW'S SECTION--------------------------------------------------------
//---------------------------------------------YOUSSEF'S SECTION----------------------------------------------------------

//-----------------------------------------------KARL'S SECTION------------------------------------------------------------
/*
These helper functions are shared utility functions used across multiple pages.

cleanSQL:
- removes unnecessary whitespace and line breaks from SQL strings
- helps keep multi-line template literal queries consistent before sending them to the demo database adapter

escapeSQL:
- escapes single quotes in text values by doubling them
- used when user input is inserted into SQL strings to reduce syntax errors caused by apostrophes

These helpers are intended for shared reuse across pages such as requests.html and index.html.
*/

// cleanSQL function takes a multi-line SQL string and normalises whitespace into a single clean line
const cleanSQL = (sql) => sql.replace(/\s+/g, " ").trim()

// escapeSQL function replaces single quotes with doubled single quotes for safe SQL string insertion
const escapeSQL = (value) => value.replace(/'/g, "''")

const runWriteSQL = async (sql) => {
    const resultJson = await window.executeDemoSQL(sql)
    if (!resultJson.success) {
        console.log("runWriteSQL Error:", resultJson.error)
    }
    return !!resultJson.success
};

//---------------------------------------------END OF KARL'S SECTION----------------------------------------------------------
//---------------------------------------------MUHAMMAD'S SECTION-------------------------------------------------------------










//---------------------------------------------END OF MUHAMMAD'S SECTION----------------------------------------------------------
