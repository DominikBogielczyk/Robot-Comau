
ACTION Idle: 
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_IDLE,
		1) THEN
		
		MpPackMLMode_Auto.Reset := 0;
		
		MpPackMLMode_Auto.Start := diStart;
			
	END_IF

END_ACTION
