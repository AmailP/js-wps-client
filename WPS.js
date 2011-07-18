/**
 * Authors:     Jachym Cepicky <jachym les-ejk cz>
 *              Valerio Angelini <amailp gmail com>
 *
 * Purpose:     Generic WPS Client for JavaScript programming language
 * Version:     0.0.2
 * Supported WPS Versions: 1.0.0
 *
 * The Library is designed to work with OpenLayers [http://openlayers.org]
 *
 * Licence:
 *  Web Processing Service Client implementation
 *  Copyright (C) 2009 Jachym Cepicky
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *
 *  TODO:
 *  - a lot
 */

/*global OpenLayers: true, console: true, window: true */

/**
 * Class: OpenLayers.WPS
 * Web Processing Service Client
 */
OpenLayers.WPS = OpenLayers.Class({
    /**
     * Property: service
     * {String}
     */
    service: "wps",
    /**
     * Property: version
     * {String}
     */
    version: "1.0.0",
    /**
     * Property: getCapabilitiesUrlGet
     * {String}
     */
    getCapabilitiesUrlGet: null,
    /**
     * Property: getCapabilitiesUrlPost
     * {String}
     */
    getCapabilitiesUrlPost: null,

    /**
     * property: responseText
     * {String}
     * Last response as text
     */
    responseText: null,

    /**
     * property: responseDOM
     * {DOM}
     * Last response as DOM
     */
    responseDOM: null,

    /**
     * property: describeProcessUrlGet
     * {string}
     */
    describeProcessUrlGet: null,
    /**
     * Property: describeProcessUrlPost
     * {String}
     */
    describeProcessUrlPost: null,
    /**
     * Property: executeUrlGet
     * {String}
     */
    executeUrlGet: null,
    /**
     * Property: executeUrlPost
     * {String}
     */
    executeUrlPost: null,

    /**
     * Property:  owsNS
     * {String}
     */
    owsNS: "http://www.opengis.net/ows/1.1",

    /**
     * Property:  owsPref
     * {String}
     */
    owsPref: "ows",

    /**
     * Property:  xlinkNS
     * {String}
     */
    xlinkNS: "http://www.w3.org/1999/xlink",

    /**
     * Property:  xlinkPref
     * {String}
     */
    xlinkPref: "xlink",

    /**
     * Property:  wpsNS
     * {String}
     */
    wpsNS: "http://www.opengis.net/wps/",

    /**
     * Property:  wpsPref
     * {String}
     */
    wpsPref: "wps",

    /**
     * Property:  title
     * {String}
     */
    title: null,

    /**
     * Property:  scope
     * {Object}
     * Scope for onSucceeded, onFailed, onStatusChanged and similar
     * functions
     *
     * Default: this
     */
    scope: this,

    /**
     * Property:  abstr
     * {String}
     */
    abstr: null,

    /**
     * Property:  processes
     * {List} Avaliable processes
     */
    processes: [],

    /**
     * Property: status
     * {String}
     */
    status: null,

    /**
     * Property: assync
     * {Boolean} status = true
     */
    assync: false,

    /**
     * Property: statusMessage
     * {String}
     */
    statusMessage: null,

    /**
     * Property: statusTime
     * {String}
     */
    statusTime: null,

    /**
     * Property: percentCompleted
     * {String}
     */
    percentCompleted: null,

    /**
     * Property: id
     * {Integer}
     */
    id: null,

    /**
     * Property: statusEvents
     * {Object}
     */
    statusEvents : {},

    /**
     * Property: requestText
     * {String}
     * The Execute request (XML) as text string
     */
    requestText : null,

    /**
     * Contructor: initialize
     *
     * Parameters:
     * url - {String} initial url of GetCapabilities request
     * options - {Object}
     */
    initialize: function (url, options) {
        'use strict';

        this.processes = [];
        OpenLayers.Util.extend(this, options);

        this.getCapabilitiesUrlGet = url;
        this.describeProcessUrlGet = url;
        this.executeUrlGet = url;
        this.getCapabilitiesUrlPost = url;
        this.describeProcessUrlPost = url;
        this.executeUrlPost = url;

        /* if (this.getCapabilitiesUrlGet) {
         this.getCapabilitiesGet(this.getCapabilitiesUrlGet);
         }
         */

        this.wpsNS += this.version;

        this.statusEvents = {
            "ProcessAccepted": this.onAccepted,
            "ProcessSucceeded": this.onSucceeded,
            "ProcessFailed": this.onFailed,
            "ProcessStarted": this.onStarted,
            "ProcessPaused": this.onPaused
        };
    },

    /**
     * Method: getCapabilities
     *
     * Parameter:
     * url - {String} if ommited, this.getCapabilitiesUrlGet is taken
     */
    getCapabilities : function (url) {
        'use strict';
        this.getCapabilitiesGet(url);
    },

    /**
     * Method: getCapabilitiesGet
     * Call GetCapabilities request via HTTP GET
     *
     * Parameter:
     * url - {String} if ommited, this.getCapabilitiesUrlGet is taken
     */
    getCapabilitiesGet : function (url) {
        'use strict';
        if (!url) {
            url = this.getCapabilitiesUrlGet;
        }
        var uri = OpenLayers.WPS.Utils.extendUrl(url, {service: this.service, version: this.version, request: "GetCapabilities"});

        OpenLayers.Request.GET({url: uri, params: {}, success: this.parseGetCapabilities, failure: this.onException, scope: this});
    },

    /**
     * Method: describeProcess
     *
     * Parameter:
     * identifier
     */
    describeProcess: function (identifier) {
        'use strict';
        if (this.describeProcessUrlGet) {
            this.describeProcessGet(identifier);
        }
    },

    /**
     * Method: describeProcessGet
     *
     * Call DescribeProcess request via HTTP GET
     *
     * Parameter:
     * identifier - {String}
     */
    describeProcessGet : function (identifier) {
        'use strict';
        var uri = OpenLayers.WPS.Utils.extendUrl(this.describeProcessUrlGet, {service: this.service,
            version: this.version,
            request: "DescribeProcess",
            identifier: identifier});

        OpenLayers.Request.GET({url: uri, params: {}, success: this.parseDescribeProcess, failure: this.onException, scope: this});
    },

    /**
     * Method: parseGetCapabilities
     * Parse input response document and call onGotCapabilities at the end
     *
     * Parameters:
     * resp - {XMLHTTP}
     */
    parseGetCapabilities: function (resp) {
        'use strict';

        var dom, operationsMetadataNode, operationsMetadata, i, operationName, getNode, getURL, postNode, postURL,
            processesNode, processes, identifier, title, processAbstract, version, process, XMLproto;

        XMLproto = OpenLayers.Format.XML.prototype;

        this.responseText = resp.responseText;
        dom = resp.responseXML || OpenLayers.parseXMLString(resp.responseText);
        this.responseDOM = dom;
        this.title = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(dom, this.owsNS, "Title")[0]);
        this.abstr = null;
        try {
            this.abstr = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(dom, this.owsNS, "Abstract")[0]);
        } catch (e1) {
        }

        // describeProcess Get, Post
        // execute Get, Post

        operationsMetadataNode = XMLproto.getElementsByTagNameNS(dom, this.owsNS, "OperationsMetadata")[0];
        operationsMetadata = XMLproto.getElementsByTagNameNS(operationsMetadataNode, this.owsNS, "Operation");
        for (i = 0; i < operationsMetadata.length; i = i + 1) {

            operationName = operationsMetadata[i].getAttribute("name");

            getNode = XMLproto.getElementsByTagNameNS(operationsMetadata[i], this.owsNS, "Get")[0];
            getURL = "";
            if (getNode) {
                getURL = XMLproto.getAttributeNS(getNode, this.xlinkNS, "href");
            }

            postNode = XMLproto.getElementsByTagNameNS(operationsMetadata[i], this.owsNS, "Post")[0];
            postURL = "";
            if (postNode) {
                postURL = XMLproto.getAttributeNS(postNode, this.xlinkNS, "href");
            }

            switch (operationName.toLowerCase()) {
                case "getcapabilities":
                    this.getCapabilitiesUrlGet = getURL;
                    this.getCapabilitiesUrlPost = postURL;
                    break;
                case "describeprocess":
                    this.describeProcessUrlGet = getURL;
                    this.describeProcessUrlPost = postURL;
                    break;
                case "execute":
                    this.executeUrlGet = getURL;
                    this.executeUrlPost = postURL;
                    break;
            }
        }

        // processes
        this.processes = [];
        processesNode = XMLproto.getElementsByTagNameNS(dom, this.wpsNS, "ProcessOfferings")[0];
        processes = XMLproto.getElementsByTagNameNS(processesNode, this.wpsNS, "Process");
        for (i = 0; i < processes.length; i = i + 1) {
            identifier = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(processes[i], this.owsNS, "Identifier")[0]);
            title = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(processes[i], this.owsNS, "Title")[0]);
            processAbstract = null;
            try {
                processAbstract = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(processes[i], this.owsNS, "Abstract")[0]);
            } catch (e2) {
            }
            version = XMLproto.getAttributeNS(processes[i], this.wpsNS, "version");
            process = new OpenLayers.WPS.Process({identifier: identifier, title: title, abstr: processAbstract, version: version, wps: this});
            this.addProcess(process);
        }

        this.onGotCapabilities();
    },

    /**
     * Method: addProcess
     * Add process to this.processes list
     *
     * Parameters:
     * process - {Object}
     */
    addProcess: function (process) {
        'use strict';
        var i, oldOne, newProcesses;
        oldOne = this.getProcess(process.identifier);
        if (oldOne) {
            newProcesses = [];
            for (i = 0; i < this.processes.length; i = i + 1) {
                if (this.processes[i] !== oldOne) {
                    newProcesses.push(this.process[i]);
                } else {
                    this.processes[i] = null;
                }
            }
            this.processes = newProcesses;
        }
        this.processes.push(process);
        process.wps = this;
    },

    /**
     * Method: parseDescribeProcess
     * Parse DescribeProcess response and call this.onDescribedProcess
     *
     * Parameters:
     * resp - {HTTPRexuest}
     */
    parseDescribeProcess: function (resp) {
        'use strict';

        var i, dom, processElements, identifier, process, processElement, storeSupported, statusSupported, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;

        try {
            this.responseText = resp.responseText;
            dom = resp.responseXML || OpenLayers.parseXMLString(resp.responseText);
            this.responseDOM = dom;

            processElements = dom.getElementsByTagName("ProcessDescription");
            for (i = 0; i < processElements.length; i = i + 1) {
                processElement = processElements[i];
                identifier = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(processElement, this.owsNS, "Identifier")[0]);
                process = this.getProcess(identifier);

                if (!process) {
                    process = new OpenLayers.WPS.Process({identifier: identifier, title: ""});
                    this.addProcess(process);
                }

                storeSupported = processElement.getAttribute("storeSupported");
                if (storeSupported) {
                    process.storeSupported = storeSupported.toLowerCase() === 'true';
                } else {
                    process.storeSupported = false;
                }

                statusSupported = processElement.getAttribute("statusSupported");
                if (statusSupported) {
                    process.statusSupported = statusSupported.toLowerCase() === 'true';
                } else {
                    process.statusSupported = false;
                }

                process.title = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(processElement, this.owsNS, "Title")[0]);
                process.abstract = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(processElement, this.owsNS, "Abstract")[0]);
                process.version = XMLproto.getAttributeNS(processElement, this.wpsNS, "processVersion");

                /* parseInputs */
                process.inputs = this.parseDescribePuts(processElement.getElementsByTagName("Input"));

                /* parseOutputs */
                process.outputs = this.parseDescribePuts(processElement.getElementsByTagName("Output"));

                this.onDescribedProcess(process);
            }

        } catch (e) {
            console.log(e);
        }
    },

    /**
     * Method: parseDescribePuts
     * Parse Inputs and Outputs of the DescribeProcess elements
     *
     * Parameters:
     * puts - {List} of {DOM}s
     *
     * Returns
     * {List} of {OpenLayers.WPS.Put}
     */
    parseDescribePuts: function (puts) {
        'use strict';

        var i, wpsputs, metadataDom, metadata, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;

        wpsputs = [];
        for (i = 0; i < puts.length; i = i + 1) {
            // inputs
            if (puts[i].getElementsByTagName("LiteralData").length > 0) {
                wpsputs.push(this.parseDescribeLiteralPuts(puts[i]));
            } else if (puts[i].getElementsByTagName("ComplexData").length > 0) {
                wpsputs.push(this.parseDescribeComplexPuts(puts[i]));
            } else if (puts[i].getElementsByTagName("BoundingBoxData").length > 0) {
                wpsputs.push(this.parseDescribeBoundingBoxPuts(puts[i]));
            }

            // outputs
            if (puts[i].getElementsByTagName("LiteralOutput").length > 0) {
                wpsputs.push(this.parseDescribeLiteralPuts(puts[i]));
            } else if (puts[i].getElementsByTagName("ComplexOutput").length > 0) {
                wpsputs.push(this.parseDescribeComplexPuts(puts[i]));
            } else if (puts[i].getElementsByTagName("BoundingBoxOutput").length > 0) {
                wpsputs.push(this.parseDescribeBoundingBoxPuts(puts[i]));
            }

            // metadata
            metadataDom = XMLproto.getElementsByTagNameNS(puts[i], this.owsNS, "Metadata");
            metadata = {};
            if (metadataDom.length > 0) {
                metadataDom[XMLproto.getAttributeNS(metadataDom[i], this.xlinkNS, "title")] = XMLproto.getChildValue(metadataDom[i]);
            }
            wpsputs[wpsputs.length - 1].metadata = metadata;
        }
        return wpsputs;
    },

    parseDescribeCommonPuts: function (dom) {
        'use strict';

        var i, identifier, title, abstr, minOccurs, maxOccurs, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;

        identifier = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(dom, this.owsNS, "Identifier")[0]);
        title = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(dom, this.owsNS, "Title")[0]);
        abstr = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(dom, this.owsNS, "Abstract")[0]);



        if (dom.attributes.getNamedItem("minOccurs")) {
            minOccurs = Number(dom.attributes.getNamedItem("minOccurs").value);
        }

        if (dom.attributes.getNamedItem("maxOccurs")) {
            maxOccurs = Number(dom.attributes.getNamedItem("maxOccurs").value);
        }

        return {
            identifier: identifier,
            title: title,
            abstract: abstr,
            minOccurs: minOccurs,
            maxOccurs: maxOccurs
        };

    },

    /**
     * Method: parseDescribeComplexPuts
     * Parse ComplexValue elements
     *
     * Parameters:
     * dom - {DOM}  input
     */
    parseDescribeComplexPuts: function (dom) {
        'use strict';

        var i, commons, formats, cmplxData, formatsNode, defaultFormatTmp, defaultFormat, supportedFormats, format;

        commons = this.parseDescribeCommonPuts(dom);

        formats = [];

        // inputs
        cmplxData = dom.getElementsByTagName("ComplexData");
        // outputs
        cmplxData = (cmplxData.length ? cmplxData : dom.getElementsByTagName("ComplexOutput"));

        if (cmplxData.length > 0) {
            // read default format first
            formatsNode = cmplxData[0].getElementsByTagName("Default")[0].getElementsByTagName("Format")[0];
            defaultFormatTmp = OpenLayers.WPS.Format.prototype.parseFormat(formatsNode);
            // all others afterwards
            supportedFormats = cmplxData[0].getElementsByTagName("Supported")[0].getElementsByTagName("Format");
            for (i = 0; i < supportedFormats.length; i = i + 1) {
                format = OpenLayers.WPS.Format.prototype.parseFormat(supportedFormats[i]);
                formats.push(format);
                if (format.equals(defaultFormatTmp)) {
                    defaultFormat = format;
                }
            }
        }

        return new OpenLayers.WPS.ComplexPut({
            identifier: commons.identifier,
            title: commons.title,
            minOccurs: commons.minOccurs,
            maxOccurs: commons.maxOccurs,
            abstract: commons.abstract,
            formats: formats,
            defaultFormat: defaultFormat,
            values: []
        });

    },

    /**
     * Method: parseDescribeBoundingBoxPuts
     * Parse BoundingBox elements
     *
     * Parameters:
     * dom - {DOM} input
     */
    parseDescribeBoundingBoxPuts: function(dom) {
        'use strict';

        var i, commons, crs, crss, domcrss, supported;

        commons = this.parseDescribeCommonPuts(dom);

        crss = [];

        // inputs
        domcrss = dom.getElementsByTagName("BoundingBoxData")[0];
        // outputs
        if (!domcrss) {
            domcrss = dom.getElementsByTagName("BoundingBoxOutput")[0];
        }

        // default first
        crss.push(OpenLayers.Format.XML.prototype.getAttributeNS(domcrss.getElementsByTagName("Default")[0].getElementsByTagName("CRS")[0], this.xlinkNS, "href"));

        // supported afterwards
        supported = domcrss.getElementsByTagName("Supported");
        for (i = 0; i < supported.length; i = i + 1) {
            crs = OpenLayers.Format.XML.prototype.getAttributeNS(supported[i].getElementsByTagName("CRS")[0], this.xlinkNS, "href");
            if (OpenLayers.WPS.Utils.isIn(crss, crs) === false) {
                crss.push(crs);
            }
        }


        return new OpenLayers.WPS.BoundingBoxPut({
            identifier: commons.identifier,
            title: commons.title,
            minOccurs: commons.minOccurs,
            maxOccurs: commons.maxOccurs,
            abstract: commons.abstract,
            crss: crss,
            values: []
        });
    },

    /**
     * Method: parseDescribeLiteralPuts
     * Parse LiteralValue elements
     *
     * Parameters:
     * dom - {DOM}  input
     */
    parseDescribeLiteralPuts: function(dom) {
        'use strict';

        var i, commons, allowedValues, type, defaultValue, nodes, dataType, min, max, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;

        commons = this.parseDescribeCommonPuts(dom);

        allowedValues = [];
        type = "string";
        defaultValue = null;

        // dataType
        dataType = XMLproto.getElementsByTagNameNS(dom, this.owsNS, "DataType")[0];
        if (dataType) {
            type = XMLproto.getChildValue(dataType).toLowerCase();
        }
        // anyValue
        if (XMLproto.getElementsByTagNameNS(dom, this.owsNS, "AnyValue").length > 0) {
            allowedValues = ["*"];
        }
        // allowedValues
        else if (XMLproto.getElementsByTagNameNS(dom, this.owsNS, "AllowedValues").length > 0) {
            nodes = XMLproto.getElementsByTagNameNS(dom, this.owsNS, "AllowedValues")[0].childNodes;
            // allowedValues
            for (i = 0; i < nodes.length; i = i + 1) {
                if (nodes[i].nodeType === 1) { // skip text and comments
                    if (nodes[i].localName === "Value") {
                        allowedValues.push(XMLproto.getChildValue(nodes[i]));
                    } else if (nodes[i].localName === "Range") {
                        // range
                        min = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(nodes[i], this.owsNS, "MinimumValue")[0]);
                        max = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(nodes[i], this.owsNS, "MaximumValue")[0]);
                        allowedValues.push([min,max]);
                    }
                }
            }

        }

        return new OpenLayers.WPS.LiteralPut({
            identifier: commons.identifier,
            title: commons.title,
            minOccurs: commons.minOccurs,
            maxOccurs: commons.maxOccurs,
            abstract : commons.abstract,
            allowedValues : allowedValues,
            type : type,
            defaultValue : defaultValue,
            values: []
        });
    },

    /**
     * Method: execute
     *
     * Parameters:
     * processIdentifier - The identifier of the process that has to be executed
     * parameters - An object containing the parameters for the WPS execution:
     *          - responseForm [string]         : "ResponseDocument" (default) || "RawDataOutput"
     *          - storeExecuteResponse [string] : "false" (default) || "true"
     *          - lineage [string] : "false" (default) || "true"
     *          - status [string] : "false" (default) || "true"
     *          - pollingInterval (ms) [int] : 5000 (default)
     * runIdentifier - A unique identifier for the starting process. This parameter is mandatory
     *                 in case of multiple concurrent executions.
     */
    execute: function(processIdentifier, parameters, runIdentifier) {
        'use strict';

        var errorMessage;

        parameters = parameters || {};

        // Setting parameters defaults
        parameters.responseForm = parameters.responseForm || "ResponseDocument";
        parameters.storeExecuteResponse = parameters.storeExecuteResponse || "false";
        parameters.lineage = parameters.lineage || "false";
        parameters.status = parameters.status || "false";
        parameters.pollingInterval = parameters.pollingInterval || 5000;

        /**
         * The executions launched without an identifier are all tagged with the "default" identifier
         */
        runIdentifier = runIdentifier || "default";

        if (parameters.responseForm != "ResponseDocument") {
            errorMessage = "The " + parameters.responseForm + " response form is not currently supported.";
            onException(this.getProcess(processIdentifier), "NoApplicableCode", errorMessage, runIdentifier);
            return;
        }

        if (this.executeUrlPost) {
            this.executePost(processIdentifier, parameters, runIdentifier);
        }
    },

    /**
     * Method: executePost
     * Call Execute Request via HTTP POST
     *
     * Parameters:
     * identifier - {String}
     * parameters - {Object}
     * runIdentifier - {String}
     */
    executePost : function(identifier, parameters, runIdentifier) {
        'use strict';

        var i, uri, process, data, inputs, input, tmpl, outputs, output, format, formatStr;
        var applyTemplate, encodeAmpersands, bboxes, runScope;

        uri = this.executeUrlPost;
        process = this.getProcess(identifier);

        data = OpenLayers.WPS.executeRequestTemplate.replace("$IDENTIFIER$", identifier);

        applyTemplate = function (template, pattern, filter) {
            var result;
            if (!filter) {
                filter = function (x) {
                    return x;
                }
            }
            result = this.map(
                function (value) {
                    return template.replace(pattern, filter(value))
                }).reduce(function(value, previous) {
                    return value + previous;
                });
            return result;
        }

        encodeAmpersands = function(value) {
            return value.replace(/&/g, "&amp;");
        }

        // inputs
        inputs = "";
        for (i = 0; i < process.inputs.length; i = i + 1) {
            input = process.inputs[i];
            tmpl = "";
            if (input.CLASS_NAME.search("Complex") > -1) {
                if (input.asReference) {
                    tmpl = applyTemplate.call(input.getValues(), OpenLayers.WPS.complexInputReferenceTemplate, "$REFERENCE$", encodeURI);
                }
                else {
                    tmpl = applyTemplate.call(input.getValues(), OpenLayers.WPS.complexInputDataTemplate, "$DATA$");
                }
            }
            else if (input.CLASS_NAME.search("Literal") > -1) {
                tmpl = applyTemplate.call(input.getValues(), OpenLayers.WPS.literalInputTemplate, "$DATA$", encodeAmpersands);
            }
            else if (input.CLASS_NAME.search("BoundingBox") > -1) {

                bboxes = input.getValues().map(function (value) {
                    var patterns = [
                        ["$DIMENSIONS$", input.dimensions],
                        ["$CRS$", input.crs],
                        ["$MINX$", value.minx],
                        ["$MINY$", value.miny],
                        ["$MAXX$", value.maxx],
                        ["$MAXY$", value.maxy]
                    ];

                    return patterns.reduce(
                        function (previous, pattern) {
                            return previous.replace(pattern[0], pattern[1]);
                        },
                        OpenLayers.WPS.boundingBoxInputTemplate);
                });

                tmpl = bboxes.reduce(function(previous, value) {
                    return previous + value
                });
            }
            tmpl = tmpl.replace(/\$IDENTIFIER\$/g, input.identifier);

            inputs += tmpl;
        }

        // outputs
        data = data.replace("$LINEAGE$", parameters.lineage);
        data = data.replace("$STORE$", parameters.storeExecuteResponse);
        data = data.replace("$STATUS$", parameters.status);
        outputs = "";
        for (i = 0; i < process.outputs.length; i = i + 1) {
            output = process.outputs[i];
            tmpl = "";
            if (output.CLASS_NAME.search("Complex") > -1) {
                tmpl = OpenLayers.WPS.complexOutputTemplate.replace("$AS_REFERENCE$", output.asReference);
                format = output.defaultFormat; // TODO support also the use of not default formats
                formatStr = "";
                if (format) {
                    if (format.mimeType) {
                        formatStr += " mimeType=\"" + format.mimeType + "\"";
                    }
                    if (format.schema) {
                        formatStr += " schema=\"" + format.schema + "\"";
                    }
                    if (format.encoding) {
                        formatStr += " encoding=\"" + format.encoding + "\"";
                    }
                }
                tmpl = tmpl.replace("$FORMAT$", formatStr);
            }
            else if (output.CLASS_NAME.search("Literal") > -1) {
                tmpl = OpenLayers.WPS.literalOutputTemplate;
            }
            else if (output.CLASS_NAME.search("BoundingBox") > -1) {
                tmpl = OpenLayers.WPS.boundingBoxOutputTemplate;
            }
            tmpl = tmpl.replace("$IDENTIFIER$", output.identifier);
            outputs += tmpl;
        }
        data = data.replace("$DATA_INPUTS$", inputs);
        data = data.replace("$OUTPUT_DEFINITIONS$", outputs);

        this.requestText = data;

        runScope = {
            wps: this,
            runIdentifier: runIdentifier,
            pollingInterval: parameters.pollingInterval
        };

        OpenLayers.Request.POST({url: uri, data: data, success: this.parseExecute, failure: this.onException, scope: runScope});
    },

    /**
     * Method: parseExecute
     * Parse Execute response
     *
     * Parameters:
     * response - {XMLHTTP}
     */
    parseExecute: function(resp) {
        'use strict';

        var i, self, text, dom, identifier, process, status, procOutputsDom, outputElements, getRequest, exception;
        var exceptionCode, locator, exceptionText, exceptionTextEl = "", runIdentifier, runScope, statusLocation, XMLproto;
        var pollingInterval;
        XMLproto = OpenLayers.Format.XML.prototype;

        runIdentifier = this.runIdentifier;
        pollingInterval = this.pollingInterval;
        self = this.wps;

        text = resp.responseText;
        self.responseText = text;
        if (OpenLayers.Util.getBrowserName() === "msie") {
            resp.responseXML = null;
            text = text.replace(/<\?xml .[^>]*>/, "");
        }
        dom = resp.responseXML || OpenLayers.parseXMLString(text);

        if (XMLproto.getChildEl(dom).localName === "ExceptionReport") {
            exception = XMLproto.getElementsByTagNameNS(dom, self.owsNS, "Exception")[0];
            exceptionCode = exception.getAttribute("exceptionCode");
            locator = exception.getAttribute("locator");
            exceptionTextEl = XMLproto.getElementsByTagNameNS(exception, self.owsNS, "ExceptionText");
            if (exceptionTextEl.length > 0) {
                exceptionText = XMLproto.getChildValue(exceptionTextEl[0]);
            }

            self.onException(null, exceptionCode, "Locator: " + locator + (exceptionText ? ("\n\nText:" + exceptionText) : ""), runIdentifier);
            return;
        }

        self.responseDOM = dom;
        try {
            statusLocation = XMLproto.getElementsByTagNameNS(dom, self.wpsNS, "ExecuteResponse")[0].getAttribute("statusLocation");
        } catch (e) {
            statusLocation = null;
        }
        identifier = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(dom, self.owsNS, "Identifier")[0]);
        process = self.getProcess(identifier);
        status = XMLproto.getElementsByTagNameNS(dom, self.wpsNS, "Status");
        if (status.length > 0) {
            self.parseStatus(status[0], runIdentifier);
        }

        if (self.status === "ProcessSucceeded" || self.status === "ProcessStarted") {
            procOutputsDom = XMLproto.getElementsByTagNameNS(dom, self.wpsNS, "ProcessOutputs");
            outputElements = null;
            if (procOutputsDom.length) {
                outputElements = XMLproto.getElementsByTagNameNS(procOutputsDom[0], self.wpsNS, "Output");
            }
            for (i = 0; i < outputElements.length; i = i + 1) {
                self.parseExecuteOutput(process, outputElements[i], runIdentifier);
            }
        } else if (self.status === "ProcessFailed") {
            self.parseProcessFailed(process, dom, runIdentifier);
        }

        // call to the correct "onStatus" user defined function
        self.statusEvents[self.status].apply(self.scope, [process, runIdentifier]);
        self.onStatusChanged(self.status, process, runIdentifier);

        if (self.status !== "ProcessFailed" && self.status !== "ProcessSucceeded") {
            if (statusLocation) {

                getRequest = function (id) {
                    runScope = {
                        wps: self,
                        runIdentifier: runIdentifier,
                        pollingInterval: pollingInterval
                    };

                    OpenLayers.Request.GET({
                        url: statusLocation,
                        params: { salt: Math.random() },
                        success: self.parseExecute,
                        failure: self.onException,
                        scope: runScope
                    });
                };

                window.setTimeout(getRequest, pollingInterval, self.id);
            }
        }
    },

    /**
     * Method: parseExecuteOutput
     * Parse wps:Output dom element, Store the value to output.value
     * property
     *
     * Parameters:
     * process - {OpenLayers.WPS.Process} process, to which this output belongs to
     * dom - {DOMelement} <wps:Output />
     */
    parseExecuteOutput: function(process, dom, runId) {
        'use strict';

        var i, identifier, outputValues, literalData, complexData, boundingBoxData, reference, node, minxy, maxxy, crs, dimensions, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;

        identifier = XMLproto.getChildValue(XMLproto.getElementsByTagNameNS(dom, this.owsNS, "Identifier")[0]);
        outputValues = process.getOutput(identifier).getValues();
        literalData = XMLproto.getElementsByTagNameNS(dom, this.wpsNS, "LiteralData");
        complexData = XMLproto.getElementsByTagNameNS(dom, this.wpsNS, "ComplexData");
        boundingBoxData = XMLproto.getElementsByTagNameNS(dom, this.wpsNS, "BoundingBox");
        reference = XMLproto.getElementsByTagNameNS(dom, this.wpsNS, "Reference");


        if (reference.length > 0) {
            outputValues[runId] = XMLproto.getAttributeNS(reference[0], this.xlinkNS, "href");
        }
        else if (literalData.length > 0) {
            outputValues[runId] = XMLproto.getChildValue(literalData[0]);
        }
        else if (complexData.length > 0) {
            // set output do DOM
            for (i = 0; i < complexData[0].childNodes.length; i = i + 1) {
                node = complexData[0].childNodes[i];
                if (node.nodeType === 1) {
                    outputValues[runId] = node;
                }
            }
            // if output is still empty, try to fetch the text content
            if (!outputValues[runId]) {
                outputValues[runId] = complexData[0].textContent;
            }
        }
        else if (boundingBoxData.length > 0) {
            minxy = XMLproto.getElementsByTagNameNS(boundingBoxData, this.owsNS, "LowerCorner");
            maxxy = XMLproto.getElementsByTagNameNS(boundingBoxData, this.owsNS, "UpperCorner");
            crs = boundingBoxData.getAttribute("crs");
            dimensions = boundingBoxData.getAttribute("dimensions");
            outputValues[runId] = [minxy.split(" ")[0], minxy.split(" ")[1], maxxy.split(" ")[0], maxxy.split(" ")[1]];
            output.dimensions = dimensions;
            output.crs = crs;
        }

    },

    /**
     * Method: setStatus
     *
     * Parameters:
     * status - {String} "ProcessSucceeded","ProcessFailed","ProcessStarted","ProcessPaused"
     * message - {String}
     * creationTime - {String}
     * percentCompleted - {Float}
     */
     // TODO Add support for multiple concurrent executions (runIdentifier)
    setStatus: function(status, message, creationTime, percentCompleted) {
        'use strict';

        this.status = status;
        this.statusMessage = message;
        this.statusTime = creationTime;
        this.percentCompleted = percentCompleted;
    },

    /**
     * Method: parseStatus
     *
     * Parameters:
     * status - {dom}
     */
     // TODO Add support for multiple concurrent executions (runIdentifier)
    parseStatus: function(status, runIdentifier) {
        'use strict';

        var k, dom, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;

        for (k in this.statusEvents) {
            if (this.statusEvents.hasOwnProperty(k)) {
                dom = XMLproto.getElementsByTagNameNS(status, this.wpsNS, k);
                if (dom.length > 0) {
                    this.setStatus(k,
                        XMLproto.getChildValue(dom[0]),
                        status.getAttribute("creationTime"),
                        dom[0].getAttribute("percentCompleted"));
                }
            }
        }
    },

    /**
     * Method: onAccepted
     * To be redefined by the user
     */
    onAccepted: function(process, runIdentifier) {
        'use strict';
    },

    /**
     * Method: onSucceeded
     * To be redefined by the user
     */
    onSucceeded: function(process, runIdentifier) {
        'use strict';
    },

    /**
     * Method: onFailed
     * To be redefined by the user
     */
    onFailed: function(process, runIdentifier) {
        'use strict';
    },

    /**
     * Method: parseProcessFailed
     *
     */
    parseProcessFailed: function(process, dom, runIdentifier) {
        'use strict';

        var Exception, code, text, ExceptionText, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;

        Exception = XMLproto.getElementsByTagNameNS(dom, this.owsNS, "Exception");
        if (Exception.length) {
            code = Exception[0].getAttribute('exceptionCode');
        }
        ExceptionText = XMLproto.getElementsByTagNameNS(dom, this.owsNS, "ExceptionText");
        if (ExceptionText.length) {
            try {
                text = XMLproto.getChildValue(ExceptionText[0]);
            } catch(e) {
                text = '';
            }
        }
        process.exception = {code: code, text: text, runIdentifier: runIdentifier};
    },

    /**
     * Method: onStarted
     * To be redefined by the user
     */
    onStarted: function(process, runIdentifier) {
        'use strict';
    },

    /**
     * Method: onPaused
     * To be redefined by the user
     */
    onPaused: function(process) {
        'use strict';
    },

    /**
     * Method: getProcess
     * Get particular process from the list of processes based on it's
     * identifier
     *
     * Parameters:
     * identifier - {String}
     *
     * Returns:
     * {Process}
     */
    getProcess: function(identifier) {
        'use strict';

        var i;

        for (i = 0; i < this.processes.length; i = i + 1) {
            if (this.processes[i].identifier === identifier) {
                return this.processes[i];
            }
        }
        return undefined;
    },

    /**
     * Method: onException
     * Called, when some exception occured
     *
     */
    onException: function (process, code, text) {
        'use strict';
    },

    /**
     * Method: onGotCapabilities
     * To be redefined by the user
     */
    onGotCapabilities: function() {
        'use strict';

    },

    /**
     * Method: onDescribedProcess
     * To be redefined by the user
     *
     * Parameters:
     * process
     */
    onDescribedProcess: function(process) {
        'use strict';

    },

    /**
     * Method: onStatusChanged
     * To be redefined by the user
     *
     * Parameters:
     * status
     * process
     */
    onStatusChanged: function(status, process) {
        'use strict';

    },

    CLASS_NAME : "OpenLayers.WPS"
});


OpenLayers.WPS.Utils = {
    /**
     * Function: extendUrl
     * Extend URL parameters with newParams object
     *
     * Parameters:
     * source - {String} url
     * newParams - {Object}
     *
     * Returns:
     * {String} new URL
     */
    extendUrl: function(source, newParams) {
        'use strict';

        var i, sourceBase, sourceParamsList, sourceParams, key, value, newParamsString;

        sourceBase = source.split("?")[0];
        try {
            sourceParamsList = source.split("?")[1].split("&");
        }
        catch (e) {
            sourceParamsList = [];
        }
        sourceParams = {};

        for (i = 0; i < sourceParamsList.length; i = i + 1) {
            key = sourceParamsList[i].split('=')[0];
            value = sourceParamsList[i].split('=')[1];
            if (key && value) {
                sourceParams[key] = value;
            }
        }
        newParams = OpenLayers.Util.extend(newParams, sourceParams);

        newParamsString = "";
        for (key in newParams) {
            if (newParams.hasOwnProperty(key)) {
                newParamsString += "&" + key + "=" + newParams[key];
            }
        }
        return sourceBase + "?" + newParamsString;
    },

    /**
     * Function:    isIn
     * Check, if some element is in array
     *
     * Parameters:
     * list - {Array}
     * elem - {Object}
     *
     * Returns:
     * {Boolean} whether the element is in the list or not
     */
    isIn  : function(list, elem) {
        'use strict';

        return list.indexOf(elem) !== -1;
    }
};


/**
 * Class OpenLayers.WPS.Process
 * Process object
 */
OpenLayers.WPS.Process = OpenLayers.Class({
    /**
     * Property: identifier
     * {String}
     */
    identifier:  null,

    /**
     * Property: title
     * {String}
     */
    title: null,

    /**
     * Property: abstract
     * {String}
     */
    abstr: null,

    /**
     * Property: inputs
     * {List}
     */
    inputs : [],

    /**
     * Property: exception
     * {Object}
     */
    exception : [],

    /**
     * Property: output
     * {List}
     *
     * The output list
     */
    outputs : [],

    /**
     * Property: metadata
     * {Object}
     */
    metadata: {},

    /**
     * Property: version
     * {String}
     */
    version: null,

    /**
     * Property: statusSupported
     * {Boolean}
     */
    statusSupported: false,

    /**
     * Property: storeSupported
     * {Boolean}
     */
    storeSupported: false,

    /**
     * Property: wps
     * {String}
     */
    wps: null,

    /**
     * Construcor: identifier
     *
     * Parameters:
     * options   {Object}
     */
    initialize: function (options) {
        'use strict';

        this.identifier = null;
        this.title = null;
        this.abst = null;
        this.inputs = [];
        this.exception = [];
        this.outputs = [];
        this.outputsMap = {};
        this.metadata = {};
        this.version = null;
        this.status = false;
        this.wps = null;
        OpenLayers.Util.extend(this, options);
    },

    /**
     * Method: addInput
     */
    addInput : function(params) {
        'use strict';
    },

    /**
     * Method: addOutput
     */
    addOutput : function(params) {
        'use strict';
    },

    /**
     * Method: execute
     */
    execute :  function() {
        'use strict';
        this.wps.execute(this.identifier);
    },

    /**
     * Method: getInput
     *
     * Parameters:
     * identifier {String}
     *
     * Returns:
     * {Object} input
     */
    getInput: function(identifier) {
        'use strict';

        var i;

        for (i = 0; i < this.inputs.length; i = i + 1) {
            if (this.inputs[i].identifier === identifier) {
                return this.inputs[i];
            }
        }
        return null;
    },

    /**
     * Method: getOutput
     *
     * Parameters:
     * identifier {String}
     *
     * Returns:
     * {Object} output
     */
    getOutput: function(identifier) {
        'use strict';

        var i;

        for (i = 0; i < this.outputs.length; i = i + 1) {
            if (this.outputs[i].identifier === identifier) {
                return this.outputs[i];
            }
        }
        return null;
    },

    CLASS_NAME: "OpenLayers.WPS.Process"
});

/**
 * Class:   OpenLayers.WPS.Put
 * In- and Outputs base class
 */
OpenLayers.WPS.Put = OpenLayers.Class({
    /**
     * Property:    identifier
     * {String}
     */
    identifier:  null,

    /**
     * Property:    title
     * {String}
     */
    title: null,

    /**
     * Property:    abstract
     * {String}
     */
    abstract: null,

    /**
     * Property:    value
     * {Object}
     */
    values: [],

    /**
     * Property:    maxOccurs
     * {Number}
     */
    maxOccurs: null,

    /**
     * Property:    minOccurs
     * {Number}
     */
    minOccurs: null,

    /**
     * Constructor:    initialize
     * {String}
     *
     * Parameters:
     * options
     */
    initialize: function(options) {
        'use strict';
        OpenLayers.Util.extend(this, options);
    },

    /**
     * Method:  setValue
     *
     * utility method to set the first value
     */
    setValue: function(value, runIdentifier) {
        'use strict';
        this.values[0] = value;
    },

    /**
     * Method:  setValues
     *
     * utility method to set the first value
     */
    setValues: function(value) {
        'use strict';
        this.values = value;
    },

    /**
     * Method:  getValue
     *
     * utility method to get the first value
     */
    getValue: function() {
        'use strict';
        if (this.values.length > 0) {
            return this.values[0];
        } else {
            return undefined;
        }
    },

    /**
     * Method:  getValues
     */
    getValues: function() {
        'use strict';
        return this.values;
    },

    /**
     * Method:  isRequired
     */
    isRequired: function() {
        return this.minOccurs > 0;
    },

    CLASS_NAME: "OpenLayers.WPS.Put"
});

OpenLayers.WPS.Format = OpenLayers.Class({
    /**
     * Property:    mimeType
     * {String}
     */
    mimeType:  null,

    /**
     * Property:    schema
     * {String}
     */
    schema: null,

    /**
     * Property:    encoding
     * {String}
     */
    encoding: null,

    /**
     * Property:    abstract
     * {String}
     */
    initialize: function (mimeType, schema, encoding) {

        this.mimeType = mimeType;

        this.schema = schema;

        this.encoding = encoding;
    },

    equals: function(other) {
        return this.mimeType === other.mimeType && this.schema === other.schema && this.encoding === other.encoding;
    },

    parseFormat: function(formatNode) {
        var mimeType, schemaEl, schema, encodingEl, encoding, XMLproto;
        XMLproto = OpenLayers.Format.XML.prototype;
        //mimeType is mandatory in the standard
        mimeType = XMLproto.getChildValue(formatNode.getElementsByTagName("MimeType")[0]);

        schemaEl = formatNode.getElementsByTagName("Schema");
        if (schemaEl.length > 0) {
            schema = XMLproto.getChildValue(schemaEl[0]);
        }

        encodingEl = formatNode.getElementsByTagName("Schema");
        if (encodingEl.length > 0) {
            encoding = XMLproto.getChildValue(encodingEl[0]);
        }

        return new OpenLayers.WPS.Format(mimeType, schema, encoding);
    }
});

/**
 * Class:   OpenLayers.WPS.LiteralPut
 * Base Class for LiteralData In- and Outputs
 */
OpenLayers.WPS.LiteralPut = OpenLayers.Class(OpenLayers.WPS.Put, {
    allowedValues:[],
    defaultValue: null,
    type: null,
    CLASS_NAME: "OpenLayers.WPS.LiteralPut"
});

/**
 * Class:   OpenLayers.WPS.ComplexPut
 * Base Class for ComplexData In- and Outputs
 */
OpenLayers.WPS.ComplexPut = OpenLayers.Class(OpenLayers.WPS.Put, {
    asReference: false,
    formats: [],
    defaultFormat: null,
    CLASS_NAME: "OpenLayers.WPS.ComplexPut"
});

/**
 * Class:   OpenLayers.WPS.BoundingBoxPut
 * Base Class for BoundingBoxData In- and Outputs
 */
OpenLayers.WPS.BoundingBoxPut = OpenLayers.Class(OpenLayers.WPS.Put, {
    dimensions: 2,
    crss: null,
    values: [
        {minx: null, miny: null, maxx: null, maxy: null, bottom: null, top: null}
    ],
    CLASS_NAME: "OpenLayers.WPS.BoundingBoxPut"
});

/**
 * Property:    executeRequestTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.executeRequestTemplate = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<wps:Execute service="WPS" version="1.0.0" ' +
    'xmlns:wps="http://www.opengis.net/wps/1.0.0" ' +
    'xmlns:ows="http://www.opengis.net/ows/1.1" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xsi:schemaLocation="http://www.opengis.net/wps/1.0.0/wpsExecute_request.xsd">' +
    '<ows:Identifier>$IDENTIFIER$</ows:Identifier>' +
    '<wps:DataInputs>' +
    "$DATA_INPUTS$" +
    '</wps:DataInputs>' +
    '<wps:ResponseForm>' +
    '<wps:ResponseDocument wps:lineage="$LINEAGE$" ' +
    'storeExecuteResponse="$STORE$" ' +
    'status="$STATUS$">' +
    "$OUTPUT_DEFINITIONS$" +
    '</wps:ResponseDocument>' +
    '</wps:ResponseForm>' +
    '</wps:Execute>';

/**
 * Property:    literalInputTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.literalInputTemplate = "<wps:Input>" +
    "<ows:Identifier>$IDENTIFIER$</ows:Identifier>" +
    "<wps:Data>" +
    "<wps:LiteralData>$DATA$</wps:LiteralData>" +
    "</wps:Data>" +
    "</wps:Input>";

/**
 * Property:    complexInputReferenceTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.complexInputReferenceTemplate = "<wps:Input>" +
    "<ows:Identifier>$IDENTIFIER$</ows:Identifier>" +
    "<wps:Data>" +
    '<wps:Reference xlink:href="$REFERENCE$"/>' +
    "</wps:Data>" +
    "</wps:Input>";

/**
 * Property:    complexInputDataTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.complexInputDataTemplate = "<wps:Input>" +
    "<ows:Identifier>$IDENTIFIER$</ows:Identifier>" +
    "<wps:Data>" +
    "<wps:ComplexData>" +
    "$DATA$" +
    "</wps:ComplexData>" +
    "</wps:Data>" +
    "</wps:Input>";
/**
 * Property:    boundingBoxInputTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.boundingBoxInputTemplate = "<wps:Input>" +
    "<ows:Identifier>$IDENTIFIER$</ows:Identifier>" +
    "<wps:Data>" +
    '<wps:BoundingBoxData ows:dimensions="$DIMENSIONS$" ows:crs="$CRS$">' +
    "<ows:LowerCorner>$MINX$ $MINY$</ows:LowerCorner>" +
    "<ows:UpperCorner>$MAXX$ $MAXY$</ows:UpperCorner>" +
    "</wps:BoundingBoxData>" +
    "</wps:Data>" +
    "</wps:Input>";

/**
 * Property:    complexOutputTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.complexOutputTemplate = '<wps:Output asReference="$AS_REFERENCE$" $FORMAT$>' +
    '<ows:Identifier>$IDENTIFIER$</ows:Identifier>' +
    "</wps:Output>";

/**
 * Property:    literalOutputTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.literalOutputTemplate = '<wps:Output asReference="false">' +
    '<ows:Identifier>$IDENTIFIER$</ows:Identifier>' +
    '</wps:Output>';

/**
 * Property:    boundingBoxOutputTemplate
 * {String} Temple for Execute Request XML
 */
OpenLayers.WPS.boundingBoxOutputTemplate = OpenLayers.WPS.literalOutputTemplate;
