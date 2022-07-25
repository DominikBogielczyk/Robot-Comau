
ACTION Held: 
	
	
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_HELD,
		1) THEN
			
		IF cmdContinue THEN
			cmdContinue:=FALSE;
			MpRoboArm6Axis_0.Interrupt:=FALSE; 
			Step:=ROBOTCTRL_CONTINUE;
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
	END_IF

END_ACTION
