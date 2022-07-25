
ACTION Stopped:
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STOPPED	,
		1) THEN
		
		MpPackMLMode_Auto.Abort := 0;
		
		MpPackMLMode_Auto.Reset := diReset;
		
	END_IF

END_ACTION
