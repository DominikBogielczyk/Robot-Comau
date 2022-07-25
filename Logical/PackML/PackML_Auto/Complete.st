
ACTION Complete: 
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_COMPLETE,
		1) THEN
			
		IF diStopped THEN
			MpPackMLAbort(gPackMLCore,1);
		END_IF
		
		
	END_IF

END_ACTION
