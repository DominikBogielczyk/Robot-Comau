
ACTION Aborting: 
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_ABORTING,
		1) THEN
		
		MpPackMLMode_Auto.Abort := 0;
		
		PackML_State := 'ABORTING';
		MpRoboArm6Axis_0.Power := FALSE; 
			
		IF NOT MpRoboArm6Axis_0.PowerOn THEN
			MpPackMLStateComplete(gPackMLCore, 1);


			Step := ROBOTCTRL_POWER_OFF;
			Step_State := 'POWER_OFF';
			
		END_IF;
	END_IF

END_ACTION
