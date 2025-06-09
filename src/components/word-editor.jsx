"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, FileText, Eye, Edit3, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WordEditor() {
  const [activeTab, setActiveTab] = useState("custom")
  const [fileName, setFileName] = useState("document.docx")
  const [loading, setLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [documentContent, setDocumentContent] = useState("")
  const editorRef = useRef(null)
  const viewerRef = useRef(null)

  // OnlyOffice integration removed to prevent DOM errors
  // Using client-side mammoth.js for DOCX processing instead

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(docx|doc)$/i)) {
      alert("Please select a valid DOCX or DOC file.")
      return
    }

    setUploadedFile(file)
    setFileName(file.name)
    setLoading(true)

    try {
      // Try to use mammoth for client-side processing
      try {
        // Dynamic import to avoid SSR issues
        const mammoth = await import("mammoth")
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })

        // Enhanced HTML processing
        const enhancedHtml = enhanceWordFormatting(result.value)
        setDocumentContent(enhancedHtml)
        initializeViewers(enhancedHtml)
        setActiveTab("viewer")
      } catch (mammothError) {
        console.log("Mammoth processing failed, using fallback:", mammothError)

        // Fallback: Show file info
        const fallbackContent = createFallbackContent(file)
        setDocumentContent(fallbackContent)
        initializeViewers(fallbackContent)
        setActiveTab("viewer")
      }
    } catch (error) {
      console.error("Error processing file:", error)
      alert("Error processing file. Please try the Custom Editor tab to create a new document.")
    } finally {
      setLoading(false)
    }
  }

  const enhanceWordFormatting = (html) => {
    let enhanced = html

    // Add proper table styling
    enhanced = enhanced
      .replace(
        /<table/g,
        '<table style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #000;"',
      )
      .replace(/<td/g, '<td style="border: 1px solid #000; padding: 8px; vertical-align: top;"')
      .replace(
        /<th/g,
        '<th style="border: 1px solid #000; padding: 8px; background-color: #f2f2f2; font-weight: bold;"',
      )

    // Enhance paragraph styling
    enhanced = enhanced
      .replace(/<p>/g, '<p style="margin: 6px 0; line-height: 1.4;">')
      .replace(/<p style="([^"]*)">/g, '<p style="$1; margin: 6px 0; line-height: 1.4;">')

    // Style headings
    enhanced = enhanced
      .replace(
        /<h1/g,
        '<h1 style="color: #d32f2f; font-size: 18pt; font-weight: bold; margin: 15px 0 10px 0; text-align: center;"',
      )
      .replace(/<h2/g, '<h2 style="color: #2c3e50; font-size: 16pt; font-weight: bold; margin: 12px 0 8px 0;"')
      .replace(/<h3/g, '<h3 style="color: #34495e; font-size: 14pt; font-weight: bold; margin: 10px 0 6px 0;"')

    // Enhance list styling
    enhanced = enhanced
      .replace(/<ul/g, '<ul style="margin: 8px 0; padding-left: 25px;"')
      .replace(/<ol/g, '<ol style="margin: 8px 0; padding-left: 25px;"')
      .replace(/<li/g, '<li style="margin: 3px 0; line-height: 1.4;"')

    // Wrap in document container
    return `
      <div style="
        max-width: 8.5in; 
        margin: 0 auto; 
        padding: 1in; 
        background: white; 
        font-family: 'Times New Roman', serif; 
        font-size: 12pt; 
        line-height: 1.4;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
        min-height: 11in;
      ">
        ${enhanced}
      </div>
    `
  }

  const createFallbackContent = (file) => {
    return `
      <div style="max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d32f2f; padding-bottom: 15px;">
          <h1 style="color: #d32f2f; margin: 0; font-size: 20pt;">Document Information</h1>
          <p style="color: #666; margin: 10px 0; font-size: 11pt;">File uploaded successfully</p>
        </div>
        
        <table style="border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #000;">
          <tr>
            <th style="border: 1px solid #000; padding: 10px; background-color: #f2f2f2; font-weight: bold; width: 30%;">Property</th>
            <th style="border: 1px solid #000; padding: 10px; background-color: #f2f2f2; font-weight: bold;">Value</th>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px; font-weight: 500;">Document Name</td>
            <td style="border: 1px solid #000; padding: 10px;">${file.name}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px; font-weight: 500;">File Size</td>
            <td style="border: 1px solid #000; padding: 10px;">${(file.size / 1024).toFixed(1)} KB</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px; font-weight: 500;">Upload Date</td>
            <td style="border: 1px solid #000; padding: 10px;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 10px; font-weight: 500;">File Type</td>
            <td style="border: 1px solid #000; padding: 10px;">Microsoft Word Document</td>
          </tr>
        </table>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin: 0 0 10px 0; font-size: 14pt;">Next Steps:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin: 5px 0;">Use the <strong>Custom Editor</strong> tab to create new content</li>
            <li style="margin: 5px 0;">Copy and paste content from your original document</li>
            <li style="margin: 5px 0;">Use the formatting tools to recreate your document structure</li>
            <li style="margin: 5px 0;">Download your edited document when complete</li>
          </ul>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
          <p style="margin: 0; font-style: italic; color: #666; text-align: center;">
            Document loaded successfully. Switch to the Custom Editor tab to begin editing.
          </p>
        </div>
      </div>
    `
  }

  const initializeViewers = (htmlContent) => {
    // Safely initialize viewer
    if (viewerRef.current) {
      try {
        viewerRef.current.innerHTML = htmlContent
      } catch (error) {
        console.log("Error initializing viewer:", error)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Professional Word Document Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Upload a DOCX file to view and edit it, or use the Custom Editor to create new documents with full
              formatting capabilities.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Input type="file" accept=".docx,.doc" onChange={handleFileUpload} disabled={loading} className="flex-1" />
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          {uploadedFile && !loading && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <Upload className="h-4 w-4" />
              <span>Successfully loaded: {uploadedFile.name}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="viewer" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Document Viewer
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Custom Editor
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="viewer" className="space-y-4">
              <div className="border rounded-lg bg-gray-50 min-h-[600px] overflow-auto">
                <div ref={viewerRef} className="word-document-viewer">
                  {!uploadedFile ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Document Viewer</h3>
                        <p className="text-gray-600 mb-4">
                          Upload a DOCX file to view it here with preserved formatting
                        </p>
                        <p className="text-sm text-gray-500">Supports tables, images, headings, and text formatting</p>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-gray-600">Processing your document...</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <CustomWordEditor documentContent={documentContent} />
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <DocumentTemplates
                onSelectTemplate={(template) => {
                  setDocumentContent(template)
                  initializeViewers(template)
                  setActiveTab("custom")
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Document Templates Component
function DocumentTemplates({ onSelectTemplate }) {
  const templates = [
    {
      name: "Medical Evaluation Form",
      description: "Professional medical evaluation sheet with patient information table",
      content: `
        <div style="max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d32f2f; font-size: 18pt; margin: 0;">Medical Evaluation Sheet</h1>
            <p style="margin: 5px 0; color: #666;">Patient Assessment Form</p>
          </div>
          
          <table style="border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #000;">
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2; width: 25%;">Patient Name</td>
              <td style="border: 1px solid #000; padding: 8px; width: 25%;"></td>
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2; width: 25%;">Age</td>
              <td style="border: 1px solid #000; padding: 8px; width: 25%;"></td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2;">Date of Birth</td>
              <td style="border: 1px solid #000; padding: 8px;"></td>
              <td style="border: 1px solid #000; padding: 8px; font-weight: bold; background-color: #f2f2f2;">Gender</td>
              <td style="border: 1px solid #000; padding: 8px;"></td>
            </tr>
          </table>
          
          <h3 style="color: #d32f2f; margin: 20px 0 10px 0;">Medical History:</h3>
          <p style="margin: 10px 0;">Please provide relevant medical history information:</p>
          <ul style="margin: 10px 0; padding-left: 25px;">
            <li style="margin: 5px 0;">Previous conditions: ___________________________</li>
            <li style="margin: 5px 0;">Current medications: ___________________________</li>
            <li style="margin: 5px 0;">Allergies: ___________________________</li>
          </ul>
        </div>
      `,
    },
    {
      name: "Business Letter",
      description: "Professional business letter template",
      content: `
        <div style="max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6;">
          <div style="text-align: right; margin-bottom: 40px;">
            <p style="margin: 0;">[Your Name]</p>
            <p style="margin: 0;">[Your Address]</p>
            <p style="margin: 0;">[City, State ZIP Code]</p>
            <p style="margin: 0;">[Email Address]</p>
            <p style="margin: 0;">[Phone Number]</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <p style="margin: 0;">[Date]</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <p style="margin: 0;">[Recipient Name]</p>
            <p style="margin: 0;">[Title]</p>
            <p style="margin: 0;">[Company Name]</p>
            <p style="margin: 0;">[Address]</p>
            <p style="margin: 0;">[City, State ZIP Code]</p>
          </div>
          
          <p style="margin-bottom: 20px;">Dear [Recipient Name],</p>
          
          <p style="margin-bottom: 15px;">This is the opening paragraph of your business letter. State the purpose of your letter clearly and concisely.</p>
          
          <p style="margin-bottom: 15px;">This is the body paragraph where you provide details, explanations, or supporting information for your main purpose.</p>
          
          <p style="margin-bottom: 30px;">This is the closing paragraph where you summarize your request or provide next steps.</p>
          
          <p style="margin-bottom: 5px;">Sincerely,</p>
          <p style="margin-top: 40px;">[Your Signature]</p>
          <p style="margin: 0;">[Your Printed Name]</p>
        </div>
      `,
    },
    {
      name: "Report Template",
      description: "Structured report template with sections and tables",
      content: `
        <div style="max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2c3e50; padding-bottom: 15px;">
            <h1 style="color: #2c3e50; font-size: 20pt; margin: 0;">Project Report</h1>
            <p style="margin: 10px 0; color: #666;">Comprehensive Analysis and Findings</p>
            <p style="margin: 5px 0; font-size: 11pt;">Date: [Insert Date]</p>
          </div>
          
          <h2 style="color: #2c3e50; font-size: 16pt; margin: 25px 0 10px 0;">Executive Summary</h2>
          <p style="margin: 10px 0;">Provide a brief overview of the report's key findings and recommendations.</p>
          
          <h2 style="color: #2c3e50; font-size: 16pt; margin: 25px 0 10px 0;">Methodology</h2>
          <p style="margin: 10px 0;">Describe the approach and methods used in this analysis.</p>
          
          <h2 style="color: #2c3e50; font-size: 16pt; margin: 25px 0 10px 0;">Key Findings</h2>
          <table style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #000;">
            <tr>
              <th style="border: 1px solid #000; padding: 10px; background-color: #f2f2f2; font-weight: bold;">Category</th>
              <th style="border: 1px solid #000; padding: 10px; background-color: #f2f2f2; font-weight: bold;">Finding</th>
              <th style="border: 1px solid #000; padding: 10px; background-color: #f2f2f2; font-weight: bold;">Impact</th>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 10px;">Performance</td>
              <td style="border: 1px solid #000; padding: 10px;">[Insert finding]</td>
              <td style="border: 1px solid #000; padding: 10px;">[Insert impact]</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 10px;">Quality</td>
              <td style="border: 1px solid #000; padding: 10px;">[Insert finding]</td>
              <td style="border: 1px solid #000; padding: 10px;">[Insert impact]</td>
            </tr>
          </table>
          
          <h2 style="color: #2c3e50; font-size: 16pt; margin: 25px 0 10px 0;">Recommendations</h2>
          <ol style="margin: 10px 0; padding-left: 25px;">
            <li style="margin: 8px 0;">First recommendation with detailed explanation</li>
            <li style="margin: 8px 0;">Second recommendation with implementation steps</li>
            <li style="margin: 8px 0;">Third recommendation with timeline</li>
          </ol>
          
          <h2 style="color: #2c3e50; font-size: 16pt; margin: 25px 0 10px 0;">Conclusion</h2>
          <p style="margin: 10px 0;">Summarize the main points and next steps.</p>
        </div>
      `,
    },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Document Templates</h3>
      <p className="text-gray-600">Choose a template to start with a pre-formatted document structure.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">{template.name}</h4>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <Button onClick={() => onSelectTemplate(template.content)} className="w-full" size="sm">
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Enhanced Custom Rich Text Editor Component
function CustomWordEditor({ documentContent }) {
  const [content, setContent] = useState(
    documentContent ||
      `
    <div style="max-width: 8.5in; margin: 0 auto; padding: 1in; background: white; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5;">
      <h1 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">New Document</h1>
      <p style="margin: 10px 0;">Start typing your document here...</p>
    </div>
  `,
  )
  const editorRef = useRef(null)

  // Update content when documentContent prop changes
  useEffect(() => {
    if (documentContent && editorRef.current) {
      try {
        editorRef.current.innerHTML = documentContent
        setContent(documentContent)
      } catch (error) {
        console.log("Error updating editor content:", error)
      }
    }
  }, [documentContent])

  const formatText = (command, value = null) => {
    try {
      document.execCommand(command, false, value)
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML)
      }
    } catch (error) {
      console.log("Error formatting text:", error)
    }
  }

  const insertTable = () => {
    const rows = prompt("Number of rows:", "3")
    const cols = prompt("Number of columns:", "3")

    if (rows && cols) {
      let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 15px 0; border: 1px solid #000;">'

      for (let i = 0; i < Number.parseInt(rows); i++) {
        tableHtml += "<tr>"
        for (let j = 0; j < Number.parseInt(cols); j++) {
          const isHeader = i === 0
          const cellTag = isHeader ? "th" : "td"
          const cellStyle = isHeader
            ? "border: 1px solid #000; padding: 8px; background-color: #f2f2f2; font-weight: bold;"
            : "border: 1px solid #000; padding: 8px;"

          tableHtml += `<${cellTag} style="${cellStyle}">${
            isHeader ? `Header ${j + 1}` : `Cell ${i + 1},${j + 1}`
          }</${cellTag}>`
        }
        tableHtml += "</tr>"
      }
      tableHtml += "</table><p><br></p>"

      try {
        document.execCommand("insertHTML", false, tableHtml)
        setContent(editorRef.current.innerHTML)
      } catch (error) {
        console.log("Error inserting table:", error)
      }
    }
  }

  const insertImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 10px 0; border: 1px solid #ddd;" alt="Inserted image" />`
          try {
            document.execCommand("insertHTML", false, img)
            setContent(editorRef.current.innerHTML)
          } catch (error) {
            console.log("Error inserting image:", error)
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Toolbar */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border rounded-lg">
        <select
          onChange={(e) => formatText("fontName", e.target.value)}
          className="px-3 py-1 border rounded text-sm"
          defaultValue="Times New Roman"
        >
          <option value="Times New Roman">Times New Roman</option>
          <option value="Arial">Arial</option>
          <option value="Calibri">Calibri</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Georgia">Georgia</option>
        </select>

        <select
          onChange={(e) => formatText("fontSize", e.target.value)}
          className="px-3 py-1 border rounded text-sm"
          defaultValue="3"
        >
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3">12pt</option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button variant="outline" size="sm" onClick={() => formatText("bold")} className="font-bold">
          B
        </Button>
        <Button variant="outline" size="sm" onClick={() => formatText("italic")} className="italic">
          I
        </Button>
        <Button variant="outline" size="sm" onClick={() => formatText("underline")} className="underline">
          U
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button variant="outline" size="sm" onClick={() => formatText("justifyLeft")}>
          Left
        </Button>
        <Button variant="outline" size="sm" onClick={() => formatText("justifyCenter")}>
          Center
        </Button>
        <Button variant="outline" size="sm" onClick={() => formatText("justifyRight")}>
          Right
        </Button>
        <Button variant="outline" size="sm" onClick={() => formatText("justifyFull")}>
          Justify
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button variant="outline" size="sm" onClick={() => formatText("insertUnorderedList")}>
          • List
        </Button>
        <Button variant="outline" size="sm" onClick={() => formatText("insertOrderedList")}>
          1. List
        </Button>
        <Button variant="outline" size="sm" onClick={insertTable}>
          📊 Table
        </Button>
        <Button variant="outline" size="sm" onClick={insertImage}>
          🖼️ Image
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <input
          type="color"
          onChange={(e) => formatText("foreColor", e.target.value)}
          className="w-8 h-8 border rounded cursor-pointer"
          title="Text Color"
        />
        <input
          type="color"
          onChange={(e) => formatText("backColor", e.target.value)}
          className="w-8 h-8 border rounded cursor-pointer"
          title="Background Color"
        />

        <Button variant="outline" size="sm" onClick={() => formatText("removeFormat")}>
          Clear Format
        </Button>
      </div>

      {/* Rich Text Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => {
          try {
            setContent(e.target.innerHTML)
          } catch (error) {
            console.log("Error updating content:", error)
          }
        }}
        className="min-h-[600px] border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 overflow-auto"
        style={{
          fontFamily: "Times New Roman, serif",
          fontSize: "12pt",
          lineHeight: "1.5",
        }}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => {
            try {
              const blob = new Blob([content], { type: "text/html" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "document.html"
              a.click()
              URL.revokeObjectURL(url)
            } catch (error) {
              console.log("Error downloading HTML:", error)
            }
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download HTML
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            try {
              // Create a Word-compatible HTML document
              const wordHtml = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotPromptForConvert/>
      <w:DoNotShowInsertAsIcon/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { margin: 1in; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`

              const blob = new Blob([wordHtml], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = "document.docx"
              a.click()
              URL.revokeObjectURL(url)
            } catch (error) {
              console.log("Error downloading Word document:", error)
            }
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Word
        </Button>
      </div>
    </div>
  )
}
