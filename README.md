# Automated-Calibration-Sheet
Script automating the work of operators calibrating machines

AutomatedCalibrationSheet.js
- Creates empty sheet based on empty matrix
- Search for muchines number from prevoius day sheet and in csv file downloaded from GDrive ( pushed to Gdrive from datebase by internal application )
- Sort numbers and fill ne sheet with datas and statuses pulled with csv file.
- Apply formating based on given conditions

AutomatedCalibrationSheetOnEdit.js
- Assigne calibrated machines to operator that made calibration, based on GMail account used to track work of every operator
- Calculate remaining machines and overal amount of machines to track work progress and daily amount of work.
