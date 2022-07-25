
ACTION Starting: 

	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STARTING,
		1) THEN
		
		MpPackMLMode_Auto.Start := 0;
		
		
		IF diExecute THEN
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
		
	END_IF
END_ACTION
