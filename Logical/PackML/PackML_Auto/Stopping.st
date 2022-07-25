
ACTION Stopping:
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STOPPING,
		1) THEN
	
		//STOP EVERYTHING
		
		IF diStopped THEN
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
		
	END_IF

END_ACTION
