
ACTION Execute: 
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_EXECUTE,
		1) THEN
			
		IF diCompleting THEN
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
		
	END_IF

END_ACTION
