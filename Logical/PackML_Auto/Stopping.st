
ACTION Stopping:
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STOPPING,
		1) THEN
		
		test := 100;
		//STOP EVERYTHING
		
		IF toStopped THEN
		//	MpPackMLStateComplete(gPackMLCore, 1);
			MpPackMLMode_Auto.StateComplete := 1;
		ELSIF toAbort THEN
			MpPackMLAbort(gPackMLCore, 1);
		END_IF
		
		END_IF

END_ACTION
