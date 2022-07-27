
ACTION Clearing: 
	
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_CLEARING,
		1) THEN
		
		MpPackMLMode_Auto.Clear := 0;
		PackML_State := 'CLEARING';
			
		IF NOT MpRoboArm6Axis_0.Error THEN
			MpPackMLStateComplete(gPackMLCore, 1);

			
		END_IF;
	END_IF
END_ACTION
