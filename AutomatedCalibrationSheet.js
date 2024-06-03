function ForEachPrinter() {
	var today = new Date();
	var dayOfWeek = today.getDay();  

	//Checks if it is a weekend
	if(dayOfWeek == 6 || dayOfWeek == 0){
	return;
	}

	//Check timer to prevent to skip outdated statuses
	var weekendExtendTimer = 0;
	//Extend timer couse of weekend ( weekend duration in milliseconds )
	if(dayOfWeek == 1){
	weekendExtendTimer = 172800000;
	}

	//Initialize sheets and ranges
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var moldSheet = ss.getSheetByName("Mold");
	var dataSheet = ss.getSheetByName("Data");
	var rangeC = dataSheet.getRange(1, 1, 60, 10);
	var rngC = rangeC.getValues();

	// Get actual sheet
	var actualSheetName = rangeC.getCell(1,2).getDisplayValue();
	var mainSheet = ss.getSheetByName(actualSheetName);
	// Make sheet for new day
	var newSheet = moldSheet.copyTo(ss).setName(Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd"));

	// Import actual data CSV from Google Drive
	ImportCsv(Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd").toString());

	// Status sheet range
	var statusSheet = ss.getSheetByName("StatusSheet");
	var rangeD = statusSheet.getRange(1, 1, 50, 10);
	var rngD = rangeD.getValues();

	// Prevoius sheet range
	var rangeA = mainSheet.getRange(1, 1, 82, 24);
	var rngA = rangeA.getValues();
	// New sheet range
	var rangeB = newSheet.getRange(1, 1, 82, 34);
	var rngB = rangeB.getValues();

	//Clear new sheet from data
	for(var i = 0 ; i < 82 ; i ++)
	{
	for(var j = 0 ; j < 24 ; j ++)
	{
	  rangeB.getCell(i+1,j+1).setValue("");
	}
	}

	//Special range of machine that should be excluded from status update
	var excludeArray = []; 
	for(var x = 9; x < 50; x++)
	{
	if(rangeC.getCell(x,10).getValue().match(/\d+/) != "" && !rangeC.getCell(x,10).isBlank())
	{
	  excludeArray.push(rangeC.getCell(x,10).getValue().match(/\d+/).toString());
	}
	}

	// Get proper numbers of machines
	var sortArray = [];
	//Add to list machines that are not excluded or empty	
	for(var i = 0 ; i < 82 ; i += 6)
	{
	for(var j = 0 ; j < 24 ; j += 5)
	{
	  var value = rangeA.getCell(i+1,j+1).getValue().toString();
	  if(value.match(/\d+/) != null && !excludeArray.includes(value.match(/\d+/).toString()))
	  {
		var number = value.match(/\d+/)[0]
	  }
	  else
	  {
		var number = null;
	  }
	  if(!rangeA.getCell(i+2,j+1).getValue().toString().includes("Wysyłka") && number != null && !rangeA.getCell(i+2,j+1).getValue().toString().includes("Wysłana"))
	  {
		sortArray.push(parseInt(number));
	  }
	}
	}

	//Add printing machines absent in previous day
	for(var i = 0 ; i < rangeD.getNumRows() ; i ++)
	{
	var value = rangeD.getCell(i+1,1).getValue().toString();
	if(value.match(/\d+/) != null && value.charAt(0) == "#")
	{
	  var number = value.match(/\d+/)[0]
	}
	else
	{
	  var number = null;
	}
	// Add machines that are not on list already and have printig status true
	if(number != null && !sortArray.includes(parseInt(number)) && !excludeArray.includes(number.toString()))
	{
		sortArray.push(parseInt(number));
	}
	}

	//Sort picked numbers
	sortArray.sort(descOrder)

	//Populate Sheet with numbers
	for(var i = 0 ; i < 82 ; i += 6)
	{
	for(var j = 0 ; j < 24 ; j += 5)
	{
	  if(sortArray.length == 0)
	  {
		break;
	  }
	  var machineNumber = sortArray.pop();
	  if(machineNumber != undefined)
	  {
	  rangeB.getCell(i+1,j+1).setValue("#" + machineNumber);
	  }
	  
	  // Populate statuses
	  for(var k = 0 ; k < rangeD.getNumRows() ; k ++)
	  {
		  var number = null;
		  var value = rangeD.getCell(k+1,1).getValue().toString();
		  if(value.match(/\d+/) != null && value.charAt(0) == "#")
		  {
			number = value.match(/\d+/)[0]
		  }
		  else
		  {
			number = null;
		  }
		  if(number == machineNumber)
		  {
			if(rangeD.getCell(k+1,2).getValue().toString() == "true")
			{
			  //Set status as "Printing" if the process is not completed by the appropriate time
			  var hours = rangeD.getCell(k+1,4).getValue().toString().split("h")[0];
			  if(hours > 8)
			  {
				rangeB.getCell(i+3,j+1).setValue("Drukuje");
			  }
			  else
			  {
				rangeB.getCell(i+3,j+1).setValue(rangeD.getCell(k+1,3).getValue().toString());
			  }
			}
			else
			{
			  //Set "Check" status if udpate timer exceed given value
			  var msFromLastPrintout = rangeD.getCell(k+1,5).getValue();
			  if(msFromLastPrintout < 64800000 + weekendExtendTimer)
			  {
				  rangeB.getCell(i+3,j+1).setValue(rangeD.getCell(k+1,3).getValue().toString());
			  }
			  else
			  {
				rangeB.getCell(i+3,j+1).setValue("*Sprawdzic*" + rangeD.getCell(k+1,3).getValue().toString());
			  }
			}
		  }
	  }

	}
	}

	//Format sheet based on conditions
	for(var i = 0 ; i < 82 ; i += 6)
	  {
		for(var j = 0 ; j < 24 ; j += 5)
		{
		  if(rangeB.getCell(i+1,j+1).getValue().toString() != "")
		  {
			if(rangeB.getCell(i+3,j+1).getValue().toString() == "")
			{
			  rangeB.getCell(i+3,j+1).setValue("-");
			  rangeB.getCell(i+2,j+1).setBackground("red");
			}
			else if (rangeB.getCell(i+3,j+1).getValue().toString() == "Drukuje")
			{
			  rangeB.getCell(i+2,j+1).setBackground("green");
			}
		  }
		}
	  }

	  // Set new sheet as actual sheet
	  actualSheetName = Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd");
	  rangeC.getCell(1,2).setValue(actualSheetName);
	}

//Function sorting array
function descOrder(element1, element2) {
  if(element1 > element2)
    return -1; //Sort element1 before element2
  if(element1 < element2)
    return 1;  //Sort element1 after element2
  return 0;    //Don't change the positions of element1 and element2
}

//Function pulling proper csv file with machines statuses form GDrive and filling data sheet with proper values
function ImportCsv(csvName) {
  var file = DriveApp.getFilesByName(csvName + ".csv").next();
  var csvData = Utilities.parseCsv(file.getBlob().getDataAsString());
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('StatusSheet');
  sheet.clear();
  sheet.getRange(1, 1, csvData.length, csvData[0].length).setValues(csvData);
}







