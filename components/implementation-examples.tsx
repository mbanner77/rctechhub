"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface ImplementationExamplesProps {
  templateId: string
}

export default function ImplementationExamples({ templateId }: ImplementationExamplesProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // CAP-Beispiel
  const capExample = `// schema.cds
namespace com.example.app;

entity Products {
  key ID : UUID;
  name : String(100);
  description : String(1000);
  price : Decimal(10,2);
  category : String(100);
  supplier : Association to Suppliers;
}

entity Suppliers {
  key ID : UUID;
  name : String(100);
  address : String(200);
  contact : String(100);
  products : Association to many Products on products.supplier = $self;
}

// service.cds
using { com.example.app as db } from '../db/schema';

service CatalogService @(path:'/catalog') {
  entity Products as projection on db.Products;
  entity Suppliers as projection on db.Suppliers;
}

// catalog-service.js
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function() {
  const { Products } = this.entities;
  
  this.before('CREATE', 'Products', async (req) => {
    if (!req.data.ID) {
      req.data.ID = UUID.generate();
    }
  });
  
  this.on('getProductsByCategory', async (req) => {
    const { category } = req.data;
    return await SELECT.from(Products).where({ category });
  });
});`

  // Fiori-Beispiel
  const fioriExample = `// manifest.json
{
  "_version": "1.40.0",
  "sap.app": {
    "id": "com.example.products",
    "type": "application",
    "title": "Products",
    "description": "Products Application",
    "applicationVersion": {
      "version": "1.0.0"
    },
    "dataSources": {
      "mainService": {
        "uri": "/catalog/",
        "type": "OData",
        "settings": {
          "odataVersion": "4.0"
        }
      }
    }
  },
  "sap.ui5": {
    "dependencies": {
      "minUI5Version": "1.108.0",
      "libs": {
        "sap.m": {},
        "sap.ui.core": {},
        "sap.f": {},
        "sap.suite.ui.generic.template": {},
        "sap.ui.comp": {},
        "sap.ui.generic.app": {},
        "sap.ui.table": {},
        "sap.ushell": {}
      }
    },
    "models": {
      "": {
        "dataSource": "mainService",
        "preload": true,
        "settings": {
          "synchronizationMode": "None",
          "operationMode": "Server",
          "autoExpandSelect": true,
          "earlyRequests": true
        }
      }
    },
    "routing": {
      "routes": [
        {
          "pattern": ":?query:",
          "name": "ProductsList",
          "target": "ProductsList"
        },
        {
          "pattern": "Products({key}):?query:",
          "name": "ProductsDetail",
          "target": "ProductsDetail"
        }
      ],
      "targets": {
        "ProductsList": {
          "type": "Component",
          "id": "ProductsList",
          "name": "sap.fe.templates.ListReport",
          "options": {
            "settings": {
              "entitySet": "Products",
              "variantManagement": "Page",
              "navigation": {
                "Products": {
                  "detail": {
                    "route": "ProductsDetail"
                  }
                }
              }
            }
          }
        },
        "ProductsDetail": {
          "type": "Component",
          "id": "ProductsDetail",
          "name": "sap.fe.templates.ObjectPage",
          "options": {
            "settings": {
              "entitySet": "Products"
            }
          }
        }
      }
    }
  }
}`

  // HANA Cloud-Beispiel
  const hanaExample = `-- Create schema
CREATE SCHEMA APP_SCHEMA;
SET SCHEMA APP_SCHEMA;

-- Create tables
CREATE TABLE PRODUCTS (
  ID NVARCHAR(36) PRIMARY KEY,
  NAME NVARCHAR(100) NOT NULL,
  DESCRIPTION NVARCHAR(1000),
  PRICE DECIMAL(10,2),
  CATEGORY NVARCHAR(100),
  SUPPLIER_ID NVARCHAR(36)
);

CREATE TABLE SUPPLIERS (
  ID NVARCHAR(36) PRIMARY KEY,
  NAME NVARCHAR(100) NOT NULL,
  ADDRESS NVARCHAR(200),
  CONTACT NVARCHAR(100)
);

-- Add foreign key constraint
ALTER TABLE PRODUCTS ADD FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIERS(ID);

-- Create index for better performance
CREATE INDEX IDX_PRODUCTS_CATEGORY ON PRODUCTS(CATEGORY);

-- Create a calculation view
CREATE VIEW PRODUCT_ANALYTICS AS
SELECT 
  p.CATEGORY,
  COUNT(*) AS PRODUCT_COUNT,
  AVG(p.PRICE) AS AVG_PRICE,
  MIN(p.PRICE) AS MIN_PRICE,
  MAX(p.PRICE) AS MAX_PRICE
FROM PRODUCTS p
GROUP BY p.CATEGORY;

-- Create a stored procedure
CREATE PROCEDURE GET_PRODUCTS_BY_CATEGORY(IN in_category NVARCHAR(100))
LANGUAGE SQLSCRIPT AS
BEGIN
  SELECT * FROM PRODUCTS WHERE CATEGORY = :in_category;
END;`

  // Integration Suite-Beispiel
  const integrationExample = `<!-- Integration Flow XML -->
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:ifl="http:///com.sap.ifl.model/Ifl.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Definitions_1">
  <bpmn2:collaboration id="Collaboration_1" name="Default Collaboration">
    <bpmn2:extensionElements>
      <ifl:property>
        <key>namespaceMapping</key>
        <value/>
      </ifl:property>
      <ifl:property>
        <key>allowedHeaderList</key>
        <value/>
      </ifl:property>
      <ifl:property>
        <key>httpSessionHandling</key>
        <value>None</value>
      </ifl:property>
      <ifl:property>
        <key>ServerTrace</key>
        <value>false</value>
      </ifl:property>
      <ifl:property>
        <key>returnExceptionToSender</key>
        <value>false</value>
      </ifl:property>
      <ifl:property>
        <key>log</key>
        <value>All events</value>
      </ifl:property>
      <ifl:property>
        <key>componentVersion</key>
        <value>1.1</value>
      </ifl:property>
      <ifl:property>
        <key>cmdVariantUri</key>
        <value>ctype::IFlowVariant/cname::IFlowConfiguration/version::1.1.17</value>
      </ifl:property>
    </bpmn2:extensionElements>
    <bpmn2:participant id="Participant_1" ifl:type="EndpointSender" name="Sender">
      <bpmn2:extensionElements>
        <ifl:property>
          <key>enableBasicAuthentication</key>
          <value>false</value>
        </ifl:property>
        <ifl:property>
          <key>ifl:type</key>
          <value>EndpointSender</value>
        </ifl:property>
      </bpmn2:extensionElements>
    </bpmn2:participant>
    <bpmn2:participant id="Participant_2" ifl:type="EndpointRecevier" name="Receiver">
      <bpmn2:extensionElements>
        <ifl:property>
          <key>ifl:type</key>
          <value>EndpointRecevier</value>
        </ifl:property>
      </bpmn2:extensionElements>
    </bpmn2:participant>
    <bpmn2:participant id="Participant_Process_1" ifl:type="IntegrationProcess" name="Integration Process" processRef="Process_1">
      <bpmn2:extensionElements/>
    </bpmn2:participant>
    <bpmn2:messageFlow id="MessageFlow_5" name="HTTPS" sourceRef="Participant_1" targetRef="StartEvent_2">
      <bpmn2:extensionElements>
        <ifl:property>
          <key>ComponentType</key>
          <value>HTTPS</value>
        </ifl:property>
        <ifl:property>
          <key>Description</key>
          <value/>
        </ifl:property>
        <ifl:property>
          <key>address</key>
          <value>/products</value>
        </ifl:property>
        <ifl:property>
          <key>componentVersion</key>
          <value>1.4</value>
        </ifl:property>
        <ifl:property>
          <key>cmdVariantUri</key>
          <value>ctype::FlowstepVariant/cname::HttpReceiver/version::1.4.1</value>
        </ifl:property>
      </bpmn2:extensionElements>
    </bpmn2:messageFlow>
    <bpmn2:messageFlow id="MessageFlow_8" name="OData" sourceRef="EndEvent_2" targetRef="Participant_2">
      <bpmn2:extensionElements>
        <ifl:property>
          <key>ComponentType</key>
          <value>OData</value>
        </ifl:property>
        <ifl:property>
          <key>Description</key>
          <value/>
        </ifl:property>
        <ifl:property>
          <key>address</key>
          <value>{{odata_service_url}}</value>
        </ifl:property>
        <ifl:property>
          <key>componentVersion</key>
          <value>1.1</value>
        </ifl:property>
        <ifl:property>
          <key>cmdVariantUri</key>
          <value>ctype::FlowstepVariant/cname::ODataReceiver/version::1.1.0</value>
        </ifl:property>
      </bpmn2:extensionElements>
    </bpmn2:messageFlow>
  </bpmn2:collaboration>
  <bpmn2:process id="Process_1" name="Integration Process">
    <bpmn2:extensionElements>
      <ifl:property>
        <key>transactionTimeout</key>
        <value>30</value>
      </ifl:property>
      <ifl:property>
        <key>componentVersion</key>
        <value>1.1</value>
      </ifl:property>
      <ifl:property>
        <key>cmdVariantUri</key>
        <value>ctype::FlowElementVariant/cname::IntegrationProcess/version::1.1.3</value>
      </ifl:property>
      <ifl:property>
        <key>transactionalHandling</key>
        <value>Required</value>
      </ifl:property>
    </bpmn2:extensionElements>
    <bpmn2:startEvent id="StartEvent_2" name="Start">
      <bpmn2:extensionElements>
        <ifl:property>
          <key>componentVersion</key>
          <value>1.0</value>
        </ifl:property>
        <ifl:property>
          <key>cmdVariantUri</key>
          <value>ctype::FlowstepVariant/cname::MessageStartEvent/version::1.0</value>
        </ifl:property>
      </bpmn2:extensionElements>
      <bpmn2:outgoing>SequenceFlow_3</bpmn2:outgoing>
      <bpmn2:messageEventDefinition/>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="EndEvent_2" name="End">
      <bpmn2:extensionElements>
        <ifl:property>
          <key>componentVersion</key>
          <value>1.0</value>
        </ifl:property>
        <ifl:property>
          <key>cmdVariantUri</key>
          <value>ctype::FlowstepVariant/cname::MessageEndEvent/version::1.0</value>
        </ifl:property>
      </bpmn2:extensionElements>
      <bpmn2:incoming>SequenceFlow_4</bpmn2:incoming>
      <bpmn2:messageEventDefinition/>
    </bpmn2:endEvent>
    <bpmn2:callActivity id="CallActivity_6" name="Content Modifier">
      <bpmn2:extensionElements>
        <ifl:property>
          <key>bodyType</key>
          <value>expression</value>
        </ifl:property>
        <ifl:property>
          <key>propertyTable</key>
          <value>&lt;row&gt;&lt;cell id="Action"&gt;Create&lt;/cell&gt;&lt;cell id="Type"&gt;property&lt;/cell&gt;&lt;cell id="Value"&gt;$\{property.category}&lt;/cell&gt;&lt;cell id="Default"&gt;&lt;/cell&gt;&lt;cell id="Name"&gt;category&lt;/cell&gt;&lt;cell id="Datatype"&gt;&lt;/cell&gt;&lt;/row&gt;</value>
        </ifl:property>
        <ifl:property>
          <key>headerTable</key>
          <value/>
        </ifl:property>
        <ifl:property>
          <key>wrapContent</key>
          <value/>
        </ifl:property>
        <ifl:property>
          <key>componentVersion</key>
          <value>1.5</value>
        </ifl:property>
        <ifl:property>
          <key>activityType</key>
          <value>Content Modifier</value>
        </ifl:property>
        <ifl:property>
          <key>cmdVariantUri</key>
          <value>ctype::FlowstepVariant/cname::ContentModifier/version::1.5.1</value>
        </ifl:property>
      </bpmn2:extensionElements>
      <bpmn2:incoming>SequenceFlow_3</bpmn2:incoming>
      <bpmn2:outgoing>SequenceFlow_4</bpmn2:outgoing>
    </bpmn2:callActivity>
    <bpmn2:sequenceFlow id="SequenceFlow_3" sourceRef="StartEvent_2" targetRef="CallActivity_6"/>
    <bpmn2:sequenceFlow id="SequenceFlow_4" sourceRef="CallActivity_6" targetRef="EndEvent_2"/>
  </bpmn2:process>
</bpmn2:definitions>`

  // Workflow Management-Beispiel
  const workflowExample = `{
  "id": "approvalworkflow",
  "name": "Approval Workflow",
  "version": "1.0.0",
  "description": "Approval workflow for product creation",
  "activities": {
    "start": {
      "id": "start",
      "name": "Start",
      "type": "start",
      "next": "getApprovers"
    },
    "getApprovers": {
      "id": "getApprovers",
      "name": "Get Approvers",
      "type": "scriptTask",
      "script": "$.context.approvers = ['approver1@example.com', 'approver2@example.com'];",
      "next": "approvalTask"
    },
    "approvalTask": {
      "id": "approvalTask",
      "name": "Approval Task",
      "type": "userTask",
      "subject": "Approve Product Creation",
      "description": "Please review and approve the product creation request",
      "priority": "MEDIUM",
      "isHiddenInLogForParticipant": false,
      "userInterface": "sapui5://html5apps/approvalui/index.html",
      "recipients": {
        "users": "$\{context.approvers}"
      },
      "decisions": [
        {
          "id": "approve",
          "name": "Approve",
          "next": "approved"
        },
        {
          "id": "reject",
          "name": "Reject",
          "next": "rejected"
        }
      ]
    },
    "approved": {
      "id": "approved",
      "name": "Approved",
      "type": "scriptTask",
      "script": "$.context.status = 'Approved';",
      "next": "sendApprovalNotification"
    },
    "rejected": {
      "id": "rejected",
      "name": "Rejected",
      "type": "scriptTask",
      "script": "$.context.status = 'Rejected';",
      "next": "sendRejectionNotification"
    },
    "sendApprovalNotification": {
      "id": "sendApprovalNotification",
      "name": "Send Approval Notification",
      "type": "mailTask",
      "to": "$\{context.requester}",
      "subject": "Product Creation Request Approved",
      "text": "Your product creation request has been approved.",
      "next": "end"
    },
    "sendRejectionNotification": {
      "id": "sendRejectionNotification",
      "name": "Send Rejection Notification",
      "type": "mailTask",
      "to": "$\{context.requester}",
      "subject": "Product Creation Request Rejected",
      "text": "Your product creation request has been rejected.",
      "next": "end"
    },
    "end": {
      "id": "end",
      "name": "End",
      "type": "end"
    }
  }
}`

  // Mobile Development Kit-Beispiel
  const mobileExample = `// Application.app
{
  "_Name": "MDK_Sample",
  "Version": "/MDK/APP_CONFIG/1.0",
  "MainPage": "/MDK_Sample/Pages/Products/Products_List.page",
  "OnWillUpdate": "/MDK_Sample/Rules/OnWillUpdate.js",
  "Styles": "/MDK_Sample/Styles/Styles.less",
  "Localization": "/MDK_Sample/i18n/i18n.properties",
  "StyleSheets": {
    "Styles": {
      "css": "Styles.css",
      "ios": "Styles.nss",
      "android": "Styles.json"
    }
  },
  "SDKStyles": {
    "ios": "/MDK_Sample/Styles/Styles.ios.nss",
    "android": "/MDK_Sample/Styles/Styles.android.json"
  },
  "OnLaunch": {
    "Action": "/MDK_Sample/Actions/Service/InitializeOffline.action",
    "RedirectToPageAfterLogin": "/MDK_Sample/Pages/Products/Products_List.page"
  }
}

// Products_List.page
{
  "Caption": "Products",
  "ActionBar": {
    "Items": [
      {
        "Position": "Right",
        "SystemItem": "Add",
        "OnPress": "/MDK_Sample/Actions/Products/NavToProducts_Create.action"
      },
      {
        "Position": "Right",
        "SystemItem": "Refresh",
        "OnPress": "/MDK_Sample/Actions/Service/SyncStartedMessage.action"
      }
    ]
  },
  "Controls": [
    {
      "Sections": [
        {
          "Header": {
            "UseTopPadding": false
          },
          "ObjectCell": {
            "AccessoryType": "disclosureIndicator",
            "Description": "{description}",
            "DetailImage": "",
            "DetailImageIsCircular": false,
            "Icons": [],
            "OnPress": "/MDK_Sample/Actions/Products/NavToProducts_Detail.action",
            "StatusImage": "",
            "Title": "{name}",
            "Footnote": "{category}",
            "PreserveIconStackSpacing": false,
            "StatusText": "{price} {currency}",
            "Subhead": "{ID}",
            "SubstatusText": ""
          },
          "Search": {
            "Enabled": true,
            "Placeholder": "Search Products",
            "BarcodeScanner": true,
            "Delay": 500,
            "MinimumCharacterThreshold": 3
          },
          "Target": {
            "EntitySet": "Products",
            "Service": "/MDK_Sample/Services/SampleService.service",
            "QueryOptions": ""
          },
          "EmptySection": {
            "Caption": "No Products Found",
            "FooterVisible": false
          },
          "_Type": "Section.Type.ObjectTable"
        }
      ],
      "LoadingIndicator": {
        "Enabled": true,
        "Text": "Loading Products..."
      },
      "PullToRefresh": {
        "Enabled": true
      },
      "_Type": "Control.Type.SectionedTable",
      "_Name": "SectionedTable"
    }
  ],
  "_Type": "Page",
  "_Name": "Products_List"
}`

  // Process Automation-Beispiel
  const processAutomationExample = `{
  "id": "purchase_order_approval",
  "name": "Purchase Order Approval",
  "description": "Automated approval process for purchase orders",
  "version": "1.0.0",
  "triggers": [
    {
      "id": "api_trigger",
      "type": "api",
      "name": "API Trigger",
      "apiDefinition": {
        "path": "/process/purchase-order-approval",
        "method": "POST",
        "requestSchema": {
          "type": "object",
          "properties": {
            "poNumber": {
              "type": "string",
              "description": "Purchase Order Number"
            },
            "vendor": {
              "type": "string",
              "description": "Vendor Name"
            },
            "amount": {
              "type": "number",
              "description": "Total Amount"
            },
            "currency": {
              "type": "string",
              "description": "Currency Code"
            },
            "requester": {
              "type": "string",
              "description": "Requester Email"
            },
            "items": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "description": {
                    "type": "string"
                  },
                  "quantity": {
                    "type": "number"
                  },
                  "unitPrice": {
                    "type": "number"
                  }
                }
              }
            }
          },
          "required": ["poNumber", "vendor", "amount", "currency", "requester"]
        }
      }
    }
  ],
  "actions": [
    {
      "id": "determine_approver",
      "type": "script",
      "name": "Determine Approver",
      "script": "if (context.amount > 10000) { context.approver = 'finance-director@example.com'; } else if (context.amount > 5000) { context.approver = 'finance-manager@example.com'; } else { context.approver = 'team-lead@example.com'; }"
    },
    {
      "id": "approval_form",
      "type": "form",
      "name": "Approval Form",
      "formDefinition": {
        "title": "Purchase Order Approval",
        "fields": [
          {
            "id": "poNumber",
            "type": "text",
            "label": "PO Number",
            "readOnly": true,
            "value": "$\{context.poNumber}"
          },
          {
            "id": "vendor",
            "type": "text",
            "label": "Vendor",
            "readOnly": true,
            "value": "$\{context.vendor}"
          },
          {
            "id": "amount",
            "type": "number",
            "label": "Amount",
            "readOnly": true,
            "value": "$\{context.amount}"
          },
          {
            "id": "currency",
            "type": "text",
            "label": "Currency",
            "readOnly": true,
            "value": "$\{context.currency}"
          },
          {
            "id": "comments",
            "type": "textarea",
            "label": "Comments",
            "required": false
          },
          {
            "id": "decision",
            "type": "radio",
            "label": "Decision",
            "required": true,
            "options": [
              {
                "id": "approve",
                "label": "Approve"
              },
              {
                "id": "reject",
                "label": "Reject"
              }
            ]
          }
        ]
      },
      "recipients": {
        "users": ["$\{context.approver}"]
      }
    },
    {
      "id": "update_po_status",
      "type": "serviceCall",
      "name": "Update PO Status",
      "serviceDefinition": {
        "destination": "ERP_System",
        "path": "/api/po/$\{context.poNumber}/status",
        "method": "PUT",
        "headers": {
          "Content-Type": "application/json"
        },
        "payload": {
          "status": "$\{context.decision === 'approve' ? 'Approved' : 'Rejected'}",
          "comments": "$\{context.comments}",
          "approver": "$\{context.approver}",
          "approvalDate": "$\{new Date().toISOString()}"
        }
      }
    },
    {
      "id": "send_notification",
      "type": "mail",
      "name": "Send Notification",
      "mailDefinition": {
        "to": ["$\{context.requester}"],
        "subject": "Purchase Order $\{context.poNumber} $\{context.decision === 'approve' ? 'Approved' : 'Rejected'}",
        "body": "Dear Requester,\n\nYour purchase order $\{context.poNumber} for $\{context.vendor} has been $\{context.decision === 'approve' ? 'approved' : 'rejected'}.\n\nAmount: $\{context.amount} $\{context.currency}\n\nComments: $\{context.comments || 'No comments provided'}\n\nRegards,\nProcurement Team"
      }
    }
  ],
  "flow": {
    "startAction": "determine_approver",
    "transitions": [
      {
        "from": "determine_approver",
        "to": "approval_form"
      },
      {
        "from": "approval_form",
        "to": "update_po_status"
      },
      {
        "from": "update_po_status",
        "to": "send_notification"
      }
    ]
  }
}`

  // Beispiele basierend auf der Vorlage anzeigen
  const getExamplesForTemplate = () => {
    switch (templateId) {
      case "hybrid-integration":
      case "integration-suite":
        return {
          integration: {
            title: "SAP Integration Suite",
            code: integrationExample,
          },
          cap: {
            title: "CAP (Cloud Application Programming Model)",
            code: capExample,
          },
          workflow: {
            title: "SAP Workflow Management",
            code: workflowExample,
          },
        }
      case "data-driven-apps":
      case "ai-ml-analytics":
        return {
          hana: {
            title: "SAP HANA Cloud",
            code: hanaExample,
          },
          cap: {
            title: "CAP (Cloud Application Programming Model)",
            code: capExample,
          },
          fiori: {
            title: "SAP Fiori Elements",
            code: fioriExample,
          },
        }
      case "intelligent-process-automation":
        return {
          workflow: {
            title: "SAP Workflow Management",
            code: workflowExample,
          },
          process: {
            title: "SAP Process Automation",
            code: processAutomationExample,
          },
          integration: {
            title: "SAP Integration Suite",
            code: integrationExample,
          },
        }
      case "mobile-first":
        return {
          mobile: {
            title: "Mobile Development Kit",
            code: mobileExample,
          },
          cap: {
            title: "CAP (Cloud Application Programming Model)",
            code: capExample,
          },
          hana: {
            title: "SAP HANA Cloud",
            code: hanaExample,
          },
        }
      case "multi-experience":
        return {
          fiori: {
            title: "SAP Fiori Elements",
            code: fioriExample,
          },
          mobile: {
            title: "Mobile Development Kit",
            code: mobileExample,
          },
          cap: {
            title: "CAP (Cloud Application Programming Model)",
            code: capExample,
          },
        }
      case "secure-devops":
        return {
          cap: {
            title: "CAP (Cloud Application Programming Model)",
            code: capExample,
          },
          fiori: {
            title: "SAP Fiori Elements",
            code: fioriExample,
          },
          integration: {
            title: "SAP Integration Suite",
            code: integrationExample,
          },
        }
      case "cap-fiori-hana":
        return {
          cap: {
            title: "CAP (Cloud Application Programming Model)",
            code: capExample,
          },
          fiori: {
            title: "SAP Fiori Elements",
            code: fioriExample,
          },
          hana: {
            title: "SAP HANA Cloud",
            code: hanaExample,
          },
        }
      default:
        return {
          cap: {
            title: "CAP (Cloud Application Programming Model)",
            code: capExample,
          },
          fiori: {
            title: "SAP Fiori Elements",
            code: fioriExample,
          },
          hana: {
            title: "SAP HANA Cloud",
            code: hanaExample,
          },
          integration: {
            title: "SAP Integration Suite",
            code: integrationExample,
          },
          workflow: {
            title: "SAP Workflow Management",
            code: workflowExample,
          },
        }
    }
  }

  const examples = getExamplesForTemplate()
  const firstTabKey = Object.keys(examples)[0]
  const [localActiveTab, setLocalActiveTab] = useState(firstTabKey)

  return (
    <div className="space-y-6">
      <Tabs value={localActiveTab} onValueChange={setLocalActiveTab}>
        <TabsList className="mb-4">
          {Object.entries(examples).map(([key, example]) => (
            <TabsTrigger key={key} value={key}>
              {example.title.split(" ").pop()}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(examples).map(([key, example]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{example.title}</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(example.code, key)}
                className="flex items-center gap-1"
              >
                {copied === key ? (
                  <>
                    <Check className="h-4 w-4" />
                    Kopiert
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Code kopieren
                  </>
                )}
              </Button>
            </div>
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto bg-gray-50 max-h-96">{example.code}</pre>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
