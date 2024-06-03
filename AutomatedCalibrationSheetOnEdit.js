function onEdit() {
	//Initialise sheets and ranges
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var dataSheet = ss.getSheetByName("Data");
	var rangeData = dataSheet.getRange(1, 1, 20, 2);
	var actualSheetName = rangeData.getCell(1,2).getValue();
	var mainSheet = ss.getSheetByName(actualSheetName);
	var activeSheet = ss.getActiveSheet();
	var cell = mainSheet.getActiveCell();
	var range = mainSheet.getRange(1, 1, 82, 40);

	//Initialise variables
	var machinesToCalibrate = 0;
	var machinesToClean = 0;
	var numberOfPrintouts = 0;
	var breakBool = false;

	//Skip if edited sheet is not actual sheet
	if(activeSheet.getName().toString() != actualSheetName)
	{
		return;
	}

	//Skip if edited cell has no function ( sript speed optimalization )
	var cellColumn = cell.getColumn().toString();
	if(cellColumn != 2 && cellColumn != 7 && cellColumn != 12 && cellColumn != 17 && cellColumn != 22 && cellColumn != 5 && cellColumn != 10 && cellColumn != 15 && cellColumn != 20 && cellColumn != 25)
	{
		return;
	}

	//Assigne picked machine to proper operator based on used gmail account after checking proper checbox or delete it from operators machine list if unchecked
	var email = Session.getActiveUser().getEmail();
	var userName = email.split('@')[0];
	if(cellColumn == 2 || cellColumn == 7 || cellColumn == 12 || cellColumn == 17 || cellColumn == 22)
	{
		for(var i = 18 ; i < 82 ; i += 6)
		  {

			if(range.getCell(i+1,26).getValue().toString() == "")
			{
			  range.getCell(i+1,26).setValue(userName);
			  for(var j = i+2; j < (i + 5); j++)
			  {
				for(var k = 26; k < 38; k++)
				{
				  if(range.getCell(j,k).getValue() == "")
				  {
					//SetMachine name
					if(cell.getValue().toString() == "true")
					{
					  range.getCell(j,k).setValue(range.getCell(cell.getRow(), cell.getColumn()-1).getValue().toString());
					}
					breakBool = true;
					break;
				  }
				  else if(range.getCell(j,k).getValue() == range.getCell(cell.getRow(), cell.getColumn()-1).getValue().toString())
				  {
					if(cell.getValue().toString() == "false")
					{
					  range.getCell(j,k).setValue("");
					  breakBool = true;
					  break;
					}
					else
					{
					  breakBool = true;
					  break;
					}
				  }
				}
				if(breakBool)
				{
				  breakBool = false;
				  break;
				}
			  }
			  break;
			}
			else if(range.getCell(i+1,26).getValue().toString() == userName)
			{
			  for(var j = i+2; j < (i + 4); j++)
			  {
				for(var k = 26; k < 38; k++)
				{
				  if(range.getCell(j,k).getValue() == "")
				  {
					//SetMachine name
					if(cell.getValue().toString() == "true")
					{
					  range.getCell(j,k).setValue(range.getCell(cell.getRow(), cell.getColumn()-1).getValue().toString());
					}
					//range.getCell(j,k).setValue("Potato");
					breakBool = true;
					break;
				  }
				  else if(range.getCell(j,k).getValue() == range.getCell(cell.getRow(), cell.getColumn()-1).getValue().toString())
				  {
					if(cell.getValue().toString() == "false")
					{
					  range.getCell(j,k).setValue("");
					  breakBool = true;
					  break;
					}
					else
					{
					  breakBool = true;
					  break;
					}
				  }
				}
				if(breakBool)
				{
				  breakBool = false;
				  break;
				}
			  }
			  break;
			}
		  }
		}



	//Based on checkboxes, calculate number of printers remainig to clean, cleaned and overal daily number
	for(var i = 0 ; i < 82 ; i += 6)
	{
		for(var j = 0 ; j < 25 ; j += 5)
		{
		  var printerName = range.getCell(i+1,j+1).getValue().toString();
		  var printoutName = range.getCell(i+3,j+1).getValue().toString();
		  if(printerName != "" && printoutName != ""&& printoutName != " " && printoutName != "Drukuje" && printoutName != "-")
		  {
			numberOfPrintouts++;
			if(range.getCell(i+1,j+2).getValue().toString() != "true")
			{
			  machinesToClean ++;
			}
			if(range.getCell(i+1,j+5).getValue().toString() != "true")
			{
			  machinesToCalibrate ++;
			}
		  }
		}
	}
	
	//Assigne values to proper cells
	range.getCell(14 ,28).setValue(machinesToClean);
	range.getCell(15 ,28).setValue(machinesToCalibrate);
	range.getCell(17 ,28).setValue(numberOfPrintouts);
}
