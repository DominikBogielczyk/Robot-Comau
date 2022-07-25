
ACTION Completing: 
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_COMPLETING,
		1) THEN
			
		IF diComplete THEN
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
		
	END_IF

END_ACTION
