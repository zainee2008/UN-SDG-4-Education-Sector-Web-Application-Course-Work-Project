/*
 * Portfolio demo database
 * -----------------------
 * The original university project sent raw SQL to a PHP/MySQL connector.
 * For the public demo, SQL runs inside the visitor's browser using sql.js.
 * Data is isolated per browser and persisted in localStorage.
 */
(function () {
    "use strict";

    const STORAGE_KEY = "bitcni-tutor-demo-db-v2";
    const currentScriptUrl = new URL(document.currentScript.src, window.location.href);
    const demoRootUrl = new URL("../", currentScriptUrl);
    const wasmUrl = new URL("vendor/sqljs/sql-wasm.wasm", demoRootUrl).href;
    let databasePromise;

    const schemaAndSeed = `
        PRAGMA foreign_keys = ON;

        CREATE TABLE tblRegion (
            regionName TEXT NOT NULL,
            regionCode TEXT PRIMARY KEY NOT NULL
        );

        CREATE TABLE tblSubject (
            subjectID INTEGER PRIMARY KEY AUTOINCREMENT,
            subjectName TEXT NOT NULL UNIQUE
        );

        CREATE TABLE tblTutor (
            tutorId INTEGER PRIMARY KEY AUTOINCREMENT,
            tutorFName TEXT NOT NULL,
            tutorLName TEXT NOT NULL,
            tutorTelephone TEXT NOT NULL,
            tutorEmail TEXT NOT NULL UNIQUE,
            tutorStatus TEXT NOT NULL CHECK (tutorStatus IN ('Available', 'Unavailable')),
            tutorEduLevel TEXT NOT NULL CHECK (tutorEduLevel IN ('Primary', 'Secondary', 'Tertiary', 'Other'))
        );

        CREATE TABLE tblDeprivation (
            SOACode TEXT PRIMARY KEY,
            deprivationRank INTEGER UNIQUE NOT NULL,
            regionCode TEXT,
            FOREIGN KEY (regionCode) REFERENCES tblRegion(regionCode)
        );

        CREATE TABLE tblSchool (
            schoolID INTEGER PRIMARY KEY AUTOINCREMENT,
            schoolName TEXT NOT NULL,
            schoolEmail TEXT,
            schoolTelephone TEXT NOT NULL,
            schoolPostcode TEXT NOT NULL,
            SOAcode TEXT NOT NULL,
            FOREIGN KEY (SOAcode) REFERENCES tblDeprivation(SOAcode)
        );

        CREATE TABLE tblRequest (
            requestID INTEGER PRIMARY KEY AUTOINCREMENT,
            schoolID INTEGER NOT NULL,
            subjectID INTEGER NOT NULL,
            requestEduLevel TEXT NOT NULL CHECK (requestEduLevel IN ('Primary', 'Secondary', 'Tertiary', 'Other')),
            requestDescription TEXT,
            requestDateCreated TEXT NOT NULL,
            FOREIGN KEY (schoolID) REFERENCES tblSchool(schoolID),
            FOREIGN KEY (subjectID) REFERENCES tblSubject(subjectID)
        );

        CREATE TABLE tblAssignment (
            AssignmentID INTEGER PRIMARY KEY AUTOINCREMENT,
            requestID INTEGER NOT NULL,
            tutorID INTEGER NOT NULL,
            assignmentDateCreated TEXT,
            assignmentDateClosed TEXT,
            FOREIGN KEY (requestID) REFERENCES tblRequest(requestID),
            FOREIGN KEY (tutorID) REFERENCES tblTutor(tutorID)
        );

        CREATE TABLE tblSubjectTutor (
            subjectID INTEGER NOT NULL,
            tutorID INTEGER NOT NULL,
            FOREIGN KEY (tutorID) REFERENCES tblTutor(tutorID),
            FOREIGN KEY (subjectID) REFERENCES tblSubject(subjectID),
            PRIMARY KEY (subjectID, tutorID)
        );

        INSERT INTO tblRegion (regionCode, regionName) VALUES
            ('BEL', 'Belfast'),
            ('NWN', 'North West'),
            ('SWN', 'South West'),
            ('EAS', 'East');

        INSERT INTO tblDeprivation (SOACode, deprivationRank, regionCode) VALUES
            ('BEL001', 42, 'BEL'),
            ('BEL002', 165, 'BEL'),
            ('BEL003', 318, 'BEL'),
            ('NWN001', 88, 'NWN'),
            ('NWN002', 410, 'NWN'),
            ('SWN001', 127, 'SWN'),
            ('SWN002', 501, 'SWN'),
            ('EAS001', 236, 'EAS');

        INSERT INTO tblSchool (schoolName, schoolEmail, schoolTelephone, schoolPostcode, SOAcode) VALUES
            ('Lanyon Community School', 'office@lanyon.example.org', '028 9000 1001', 'BT7 1NN', 'BEL001'),
            ('Ravenhill Primary School', 'office@ravenhill.example.org', '028 9000 1002', 'BT6 8AB', 'BEL002'),
            ('Belfast Learning Academy', 'hello@bla.example.org', '028 9000 1003', 'BT1 5GS', 'BEL003'),
            ('Foyle Community College', 'office@foyle.example.org', '028 7100 2001', 'BT48 7JL', 'NWN001'),
            ('North Coast Academy', 'office@northcoast.example.org', '028 7100 2002', 'BT52 1SA', 'NWN002'),
            ('Erne Integrated School', 'office@erne.example.org', '028 6600 3001', 'BT74 7EF', 'SWN001'),
            ('Orchard County College', 'office@orchard.example.org', '028 3700 3002', 'BT61 7QZ', 'SWN002'),
            ('Strangford Learning Centre', 'office@strangford.example.org', '028 9100 4001', 'BT23 4EU', 'EAS001');

        INSERT INTO tblSubject (subjectName) VALUES
            ('Mathematics'),
            ('English'),
            ('Science'),
            ('History'),
            ('Geography'),
            ('Computing'),
            ('Modern Languages'),
            ('Art and Design');

        INSERT INTO tblTutor (tutorFName, tutorLName, tutorTelephone, tutorEmail, tutorStatus, tutorEduLevel) VALUES
            ('Aisha', 'Khan', '+44 7700 900101', 'aisha.khan@example.org', 'Available', 'Secondary'),
            ('Daniel', 'Murphy', '+44 7700 900102', 'daniel.murphy@example.org', 'Available', 'Primary'),
            ('Sofia', 'Rossi', '+44 7700 900103', 'sofia.rossi@example.org', 'Unavailable', 'Tertiary'),
            ('Noah', 'Campbell', '+44 7700 900104', 'noah.campbell@example.org', 'Available', 'Secondary'),
            ('Amara', 'Okafor', '+44 7700 900105', 'amara.okafor@example.org', 'Available', 'Primary'),
            ('Leo', 'Martin', '+44 7700 900106', 'leo.martin@example.org', 'Unavailable', 'Other'),
            ('Maya', 'Patel', '+44 7700 900107', 'maya.patel@example.org', 'Available', 'Tertiary'),
            ('Jack', 'Wilson', '+44 7700 900108', 'jack.wilson@example.org', 'Available', 'Secondary'),
            ('Zara', 'Ahmed', '+44 7700 900109', 'zara.ahmed@example.org', 'Available', 'Primary'),
            ('Finn', 'O''Neill', '+44 7700 900110', 'finn.oneill@example.org', 'Unavailable', 'Secondary'),
            ('Hana', 'Kim', '+44 7700 900111', 'hana.kim@example.org', 'Available', 'Other'),
            ('Ben', 'Taylor', '+44 7700 900112', 'ben.taylor@example.org', 'Available', 'Tertiary');

        INSERT INTO tblSubjectTutor (subjectID, tutorID) VALUES
            (1, 1), (6, 1),
            (2, 2), (4, 2),
            (3, 3), (1, 3),
            (3, 4), (5, 4),
            (2, 5), (7, 5),
            (8, 6),
            (1, 7), (6, 7),
            (3, 8), (6, 8),
            (2, 9),
            (4, 10), (5, 10),
            (7, 11), (8, 11),
            (1, 12), (3, 12);

        INSERT INTO tblRequest (schoolID, subjectID, requestEduLevel, requestDescription, requestDateCreated) VALUES
            (1, 1, 'Secondary', 'GCSE algebra and exam technique support.', '2026-08-01'),
            (1, 6, 'Secondary', 'Introductory programming club support.', '2026-08-03'),
            (2, 2, 'Primary', 'Reading confidence and comprehension sessions.', '2026-08-04'),
            (3, 3, 'Secondary', 'Practical science revision programme.', '2026-08-05'),
            (4, 5, 'Secondary', 'Geography fieldwork preparation.', '2026-08-06'),
            (4, 1, 'Secondary', 'Numeracy catch-up sessions.', '2026-08-07'),
            (5, 7, 'Primary', 'Conversational French activities.', '2026-08-08'),
            (6, 2, 'Primary', 'Small-group literacy support.', '2026-08-09'),
            (6, 4, 'Secondary', 'Local history research guidance.', '2026-08-10'),
            (7, 6, 'Tertiary', 'Web development mentoring.', '2026-08-11'),
            (7, 8, 'Other', 'Portfolio development workshops.', '2026-08-12'),
            (8, 3, 'Secondary', 'Biology and chemistry revision.', '2026-08-13'),
            (2, 1, 'Primary', 'Core arithmetic practice.', '2026-08-14'),
            (3, 2, 'Secondary', 'Creative writing feedback sessions.', '2026-08-15');

        INSERT INTO tblAssignment (requestID, tutorID, assignmentDateCreated, assignmentDateClosed) VALUES
            (1, 1, '2026-08-02', NULL),
            (3, 2, '2026-08-05', NULL),
            (4, 8, '2026-08-06', '2026-08-15'),
            (5, 4, '2026-08-08', NULL),
            (7, 5, '2026-08-10', NULL),
            (10, 7, '2026-08-12', NULL),
            (12, 3, '2026-08-14', NULL),
            (13, 9, '2026-08-15', NULL);
    `;

    const bytesToBase64 = (bytes) => {
        let binary = "";
        const chunkSize = 0x8000;
        for (let index = 0; index < bytes.length; index += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
        }
        return window.btoa(binary);
    };

    const base64ToBytes = (base64) => {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
    };

    const saveDatabase = (database) => {
        window.localStorage.setItem(STORAGE_KEY, bytesToBase64(database.export()));
    };

    const registerCompatibilityFunctions = (database) => {
        database.create_function("CONCAT", (...values) =>
            values.map((value) => value ?? "").join("")
        );
        database.create_function("CURDATE", () => new Date().toISOString().slice(0, 10));
        database.create_function("DATEDIFF", (endDate, startDate) => {
            const millisecondsPerDay = 24 * 60 * 60 * 1000;
            const difference = new Date(endDate).getTime() - new Date(startDate).getTime();
            return Math.floor(difference / millisecondsPerDay);
        });
    };

    const createDatabase = async () => {
        if (typeof window.initSqlJs !== "function") {
            throw new Error("The demo database library could not be loaded.");
        }

        const SQL = await window.initSqlJs({ locateFile: () => wasmUrl });
        const savedDatabase = window.localStorage.getItem(STORAGE_KEY);
        let database;

        if (savedDatabase) {
            try {
                database = new SQL.Database(base64ToBytes(savedDatabase));
            } catch (error) {
                console.warn("Saved demo data was invalid; loading a clean dataset.", error);
                window.localStorage.removeItem(STORAGE_KEY);
            }
        }

        if (!database) {
            database = new SQL.Database();
            database.exec(schemaAndSeed);
            saveDatabase(database);
        }

        registerCompatibilityFunctions(database);
        database.exec("PRAGMA foreign_keys = ON;");
        return database;
    };

    const getDatabase = () => {
        if (!databasePromise) {
            databasePromise = createDatabase();
        }
        return databasePromise;
    };

    const resultRows = (resultSet) => resultSet.values.map((values) => {
        const row = {};
        resultSet.columns.forEach((column, index) => {
            row[column] = values[index];
        });
        return row;
    });

    window.executeDemoSQL = async (sql) => {
        if (typeof sql !== "string" || sql.trim() === "") {
            return { success: false, error: "No SQL statement was provided." };
        }

        try {
            const database = await getDatabase();
            const statement = sql
                .trim()
                .replace(/\bCURRENT_DATE\s*\(\s*\)/gi, "CURDATE()");
            const resultSets = database.exec(statement);
            const isRead = /^(SELECT|WITH|PRAGMA|EXPLAIN)\b/i.test(statement);

            if (!isRead) {
                saveDatabase(database);
            }

            if (resultSets.length > 0) {
                return { success: true, data: resultRows(resultSets[0]) };
            }

            return {
                success: true,
                data: isRead ? [] : undefined,
                affected_rows: database.getRowsModified()
            };
        } catch (error) {
            console.error("Demo database error:", error);
            return { success: false, error: error.message };
        }
    };

    window.resetDemoDatabase = () => {
        const shouldReset = window.confirm(
            "Reset this demo to its original sample data? Your changes in this browser will be removed."
        );
        if (!shouldReset) {
            return;
        }
        window.localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    };

    const addDemoBanner = () => {
        if (document.querySelector(".demo-mode-banner")) {
            return;
        }

        const banner = document.createElement("aside");
        banner.className = "demo-mode-banner";
        banner.setAttribute("aria-label", "Portfolio demo information");

        const message = document.createElement("span");
        message.textContent = "Portfolio demo — changes are saved only in this browser.";

        const resetButton = document.createElement("button");
        resetButton.type = "button";
        resetButton.textContent = "Reset sample data";
        resetButton.addEventListener("click", window.resetDemoDatabase);

        banner.append(message, resetButton);
        document.body.prepend(banner);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addDemoBanner);
    } else {
        addDemoBanner();
    }
})();
