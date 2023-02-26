'-------------------------------------------------------------------
' Excelファイルの中で、文字列が入ったセルから文字列を抜き出すサンプル
' this is a sample extracting string from excel files.
'-------------------------------------------------------------------
' Usage: csript excelparse.vbs input.xls  left-top-cell  right-bottom-cell
' Example:
' If you want to print sample.xls's  B5 to E7 celss, put the followig command.
' cscript excelparse.vbs sample.xls B5 E7
'-------------------------------------------------------------------

set objXls = CreateObject("Excel.Application")
objXls.Visible=False
objXls.ScreenUpdating=False

Dim filename
Dim left_top_cell
Dim right_bottom_cel 
filename = Wscript.Arguments(0)
left_top_cell = Wscript.Arguments(1)
right_bottom_cell = Wscript.Arguments(2)

call ParseExcel(filename, left_top_cell, right_bottom_cell)

'-----------------------------------------------------
' 標準出力(Print stdout)
'-----------------------------------------------------
Function Print(m)
    WScript.Stdout.Write m
End Function

'-----------------------------------------------------
' Get Full path
'-----------------------------------------------------
Function GetFullPath(ByRef filename)
    GetFullPath = CreateObject("Scripting.FileSystemObject").GetAbsolutePathName(filename)
End Function

'-----------------------------------------------------
' Excelファイルをパースして出力
' print out excel file
' filename .............. excel filename パースするExcelファイル
' left_top_cell ......... left_top_cell string(example ... "B5")
' right_bottom_cell ..... right_bottom_cell string (such as "D10")
'-----------------------------------------------------
Sub ParseExcel(ByRef filename, ByRef left_top_cell, ByRef right_bottom_cell)
    Dim wb,s
    Dim lef_top_row
    Dim lef_top_col
    Dim right_bottom_row
    Dim right_bottom_col

    Set wb = objXls.Workbooks.Open(GetFullPath(filename))
    Dim i
    For i=1 To wb.Sheets.Count
    	Set s = wb.Sheets(i)
	Set lt = s.Range("A1:" & left_top_cell)
	Set rb = s.Range("A1:" & right_bottom_cell)
	left_top_row = lt.Rows.Count    
	left_top_col = lt.Columns.Count    
	right_bottom_row = rb.Rows.Count    
	right_bottom_col = rb.Columns.Count    
	Call PrintRange(s, left_top_row, right_bottom_row, left_top_col, right_bottom_col)
    Next
    wb.Close
End Sub


'-----------------------------------------------------
' 指定された範囲のセルの文字列を表示する。
' print out specific range cells
' sheet .......... シートObject
' startRow ....... 行の開始位置(left_top_row)
' endRow ......... 行の終了位置(right_bottom_row)
' startCol ....... 列の開始位置(left_top_col)
' endCol ......... 列の終了位置(right_bottom_col)
'-----------------------------------------------------
Sub PrintRange(ByRef sheet, ByVal startRow, ByVal endRow, ByVal startCol, ByVal endCol)
    Dim y
    Dim x
    For y=startRow To endRow
    	For x=startCol To endCol
	    Set c = sheet.Cells(y,x)
	    Print(c.Text & ",")
    	Next
        Print(vbCrLf)
    Next
End Sub
