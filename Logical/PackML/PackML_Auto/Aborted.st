
ACTION Aborted: 
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_ABORTED,
		1) THEN
		
		PackML_State := 'ABORTED';
		MpRoboArm6Axis_0.Power := FALSE; 
			
		IF MpRoboArm6Axis_0.ErrorReset THEN
			MpPackMLStateComplete(gPackMLCore, 1);
			
			MpPackMLMode_Auto.Clear := 1;
			
		END_IF;
	END_IF

END_ACTION
