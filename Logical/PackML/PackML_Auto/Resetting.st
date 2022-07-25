
ACTION Resetting:
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_RESETTING,
		1) THEN
		
		CASE Step OF
			ROBOTCTRL_POWER: 
				IF MpRoboArm6Axis_0.Info.ReadyToPowerOn THEN
					MpRoboArm6Axis_0.Power := TRUE; 
					Step := ROBOTCTRL_WAIT_POWER; 
				END_IF; 
		
			ROBOTCTRL_WAIT_POWER: 
				IF MpRoboArm6Axis_0.PowerOn THEN
					Step := ROBOTCTRL_HOME; 
				END_IF;
		
			ROBOTCTRL_HOME: 
				MpRoboArm6Axis_0.Home := TRUE; 
				Step := ROBOTCTRL_WAIT_HOME;
			
			ROBOTCTRL_WAIT_HOME: 
				IF MpRoboArm6Axis_0.IsHomed THEN
					MpRoboArm6Axis_0.Home := FALSE; 
					Step := ROBOTCTRL_READY;
					MpPackMLStateComplete(gPackMLCore, 1);
					
				END_IF; 
			
				END_CASE;
		
	END_IF; 
END_ACTION
