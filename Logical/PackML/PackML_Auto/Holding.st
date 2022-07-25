
ACTION Holding: 
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_HOLDING,
		1) THEN
			
		MpRoboArm6Axis_0.Interrupt:=TRUE; 
		IF MpRoboArm6Axis_0.MoveInterrupted THEN
			Step:=ROBOTCTRL_INTERRUPTING;
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
	END_IF
	
	

END_ACTION
