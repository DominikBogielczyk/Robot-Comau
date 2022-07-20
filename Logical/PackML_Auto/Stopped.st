
ACTION Stopped:
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STOPPED,
		1) THEN
		
		MpPackMLMode_Auto.Reset := 0;
		
		IF diReset THEN
			MpPackMLStateComplete(gPackMLCore, 1);
		ELSIF toAbort THEN
			MpPackMLAbort(gPackMLCore, 1);
		END_IF
		
	END_IF

END_ACTION
