
ACTION Resetting:
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_RESETTING,
		1) THEN
		
		
		IF diIdle THEN
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
		
	END_IF

END_ACTION
