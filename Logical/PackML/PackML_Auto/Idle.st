
ACTION Idle: 
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_IDLE,
		1) THEN
		
		MpPackMLMode_Auto.Reset := 0;

		
		CASE Step OF
			ROBOTCTRL_READY: 
				MpRoboArm6Axis_0.MoveProgram := 0;
 
				IF NOT(MpRoboArm6Axis_0.PowerOn) THEN
					Step := ROBOTCTRL_DISABLED; 
					MpPackMLMode_Auto.Stop := TRUE;
				END_IF;
			 
				IF diStart THEN // diStart is active robot starts procedure 
					diStart := FALSE;
					MpPackMLMode_Auto.Start := TRUE;
					Step := ROBOTCTRL_CHECK; 
				END_IF;
					
			
			
		END_CASE;
			
	END_IF

END_ACTION
