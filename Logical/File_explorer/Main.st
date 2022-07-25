
PROGRAM _INIT
	(* Insert code here *)
	MpFileManagerUI_0(MpLink := ADR(gFileManagerUI), Enable :=1 , ErrorReset :=0 , UISetup :=MpFileMngSetup , UIConnect :=ADR(MpFileMngConnect));
	MpFileMngConnect.DeviceList.DeviceNames[0] := 'F';
END_PROGRAM

PROGRAM _CYCLIC
	(* Insert code here *)
	MpFileManagerUI_0();
	
	FOR iFile := 0 TO 49 BY 1 DO
		(* create arrays with file properties *)
		brsmemcpy(ADR(tabInfo.Name[iFile]), ADR(MpFileMngConnect.File.List.Items[iFile].Name), SIZEOF(tabInfo.Name[iFile]));
		brsmemcpy(ADR(tabInfo.Size[iFile]), ADR(MpFileMngConnect.File.List.Items[iFile].Size), SIZEOF(tabInfo.Size[iFile]));
		brsmemcpy(ADR(tabInfo.Type[iFile]), ADR(MpFileMngConnect.File.List.Items[iFile].ItemType), SIZEOF(tabInfo.Type[iFile]));
		brsmemcpy(ADR(tabInfo.LastModified[iFile]), ADR(MpFileMngConnect.File.List.Items[iFile].LastModified), SIZEOF(tabInfo.LastModified[iFile]));
		IF tabInfo.SelectedRow = iFile THEN
			MpFileMngConnect.File.List.Items[iFile].IsSelected := TRUE;
		END_IF
		(* numbers of elements in the table *)
		IF tabInfo.Type[iFile] <> mpFILE_ITEM_TYPE_NONE THEN
			tabInfo.NumberOfElements := tabInfo.NumberOfElements + 1;
		END_IF
	END_FOR


END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 MpFileManagerUI_0.Enable := FALSE;
END_PROGRAM

