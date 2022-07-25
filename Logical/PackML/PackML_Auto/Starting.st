
ACTION Starting: 

	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STARTING,
		1) THEN
		
		MpPackMLMode_Auto.Start := 0;
		
		
		CASE Step OF
			ROBOTCTRL_CHECK: 	//checking if aim targets are available
				AimIsGood:=TRUE;
				FOR x:=0  TO SizeOfArray DO
					pom[0]:=1;
					IF gAimPos[x]>0 THEN
						pom[1]:=1;
						IF (gIsPosGood[x]=FALSE) THEN 
							pom[2]:=1;
							Step:=ROBOTCTRL_ERROR_WRONG_AIM; 
							AimIsGood:=0; 
						END_IF;	
					END_IF;		
				END_FOR;
				IF AimIsGood=TRUE THEN
					y:=0;
					Step:=ROBOTCTRL_CALCULATE;
					MpPackMLStateComplete(gPackMLCore, 1);
				END_IF;	
			
			ROBOTCTRL_ERROR_WRONG_AIM:
				//handling wrong target error 
				IF diAck THEN
					diAck:=FALSE;
					Step:=ROBOTCTRL_CHECK;
				END_IF;
			
		END_CASE;
		
	END_IF
END_ACTION
