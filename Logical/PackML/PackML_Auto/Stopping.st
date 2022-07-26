
ACTION Stopping:
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STOPPING,
		1) THEN
	
		//STOP EVERYTHING
		MpRoboArm6Axis_0.Stop := TRUE;
		MpRoboArm6Axis_0.Power := FALSE; 
	
		
		
		IF NOT MpRoboArm6Axis_0.InMotion THEN
			MpPackMLStateComplete(gPackMLCore, 1);
			END_IF;
	
		
	END_IF

END_ACTION
