
ACTION Execute: 
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_EXECUTE,
		1) THEN

		
		CASE Step OF
			ROBOTCTRL_CALCULATE:
				//checking if any move is needed and if all moves are done 
				IF	P1P2_Ok THEN
					Step:=ROBOTCTRL_IS_MOVE_NEEDED;
				ELSIF y<IndexSize THEN
					Step:=ROBOTCTRL_CALCULATE_P1;
				ELSE 
					diStart:=FALSE;
					Step:=ROBOTCTRL_READY;
					MpPackMLStateComplete(gPackMLCore, 1);
				END_IF;
				
				
			ROBOTCTRL_CALCULATE_P1:	
				//assigning values to P1 and P1up
				FOR x:=0  TO SizeOfArray DO
					IF gActPos[x]=Index[y] THEN
						pom[3]:=1;
						P1.Orient.Angle1:=gRobPos[x].Orient.Angle1;
						P1.Orient.Angle2:=gRobPos[x].Orient.Angle2;
						P1.Orient.Angle3:=gRobPos[x].Orient.Angle3;
						P1.Pos.X:=gRobPos[x].Pos.X;
						P1.Pos.Y:=gRobPos[x].Pos.Y;
						P1.Pos.Z:=gRobPos[x].Pos.Z;
						P1up.Orient.Angle1:=gRobPos[x].Orient.Angle1;
						P1up.Orient.Angle2:=gRobPos[x].Orient.Angle2;
						P1up.Orient.Angle3:=gRobPos[x].Orient.Angle3;
						P1up.Pos.X:=gRobPos[x].Pos.X;
						P1up.Pos.Y:=gRobPos[x].Pos.Y;
						P1up.Pos.Z:=gRobPos[x].Pos.Z+100;
					
					
					
					END_IF;	
				END_FOR;
				Step:=ROBOTCTRL_CALCULATE_P2;

			ROBOTCTRL_CALCULATE_P2:	
				//assigning values to P2 and P2up
				FOR x:=0  TO SizeOfArray DO
					IF gAimPos[x]=Index[y] THEN
						pom[4]:=1;
						P2.Orient.Angle1:=gRobPos[x].Orient.Angle1;
						P2.Orient.Angle2:=gRobPos[x].Orient.Angle2;
						P2.Orient.Angle3:=gRobPos[x].Orient.Angle3;
						P2.Pos.X:=gRobPos[x].Pos.X;
						P2.Pos.Y:=gRobPos[x].Pos.Y;
						P2.Pos.Z:=gRobPos[x].Pos.Z;
						P2up.Orient.Angle1:=gRobPos[x].Orient.Angle1;
						P2up.Orient.Angle2:=gRobPos[x].Orient.Angle2;
						P2up.Orient.Angle3:=gRobPos[x].Orient.Angle3;
						P2up.Pos.X:=gRobPos[x].Pos.X;
						P2up.Pos.Y:=gRobPos[x].Pos.Y;
						P2up.Pos.Z:=gRobPos[x].Pos.Z+100;
					
					
					END_IF;	
				END_FOR;
				P1P2_Ok:=1; // this flag means that new P1 and new P2 have been assigned  
				Step:=ROBOTCTRL_CALCULATE;

			ROBOTCTRL_IS_MOVE_NEEDED:
				//checking if actual and aim positions are not the same 
				IF P1.Orient.Angle1=P2.Orient.Angle1 AND P1.Pos.X=P2.Pos.X AND P1.Orient.Angle2=P2.Orient.Angle2 AND P1.Pos.Y=P2.Pos.Y AND P1.Orient.Angle3=P2.Orient.Angle3 AND P1.Pos.Z=P2.Pos.Z THEN
					y:=y+1;
					P1P2_Ok:=0;
					Step:=ROBOTCTRL_CALCULATE;
				ELSE
					Step:=ROBOTCTRL_MOVE;
				END_IF;

			ROBOTCTRL_MOVE:
				IF cmdInterrupt OR MpRoboArm6Axis_0.MoveInterrupted THEN
					cmdInterrupt := FALSE; 
					Step:=ROBOTCTRL_INTERRUPT;
					MpPackMLMode_Auto.Hold := 1;
				END_IF; 


				//executing move procedure
				MpRoboArm6Axis_0.MoveProgram:=1;
				IF MpRoboArm6Axis_0.MoveDone THEN
					MpRoboArm6Axis_0.MoveProgram:=0;
					y:=y+1;
					P1P2_Ok:=0;
				 	Step:=ROBOTCTRL_CALCULATE;
					
				END_IF 
			
		END_CASE;
		
	END_IF

END_ACTION
