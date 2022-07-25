
ACTION Complete: 
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_COMPLETE,
		1) THEN
			
	//MpPackMLMode_Auto.Stop := 1;
		IF diReset THEN
			MpPackMLStateComplete(gPackMLCore, 1);
			END_IF;
	END_IF

END_ACTION
