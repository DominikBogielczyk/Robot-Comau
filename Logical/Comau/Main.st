
PROGRAM _INIT
	RestorePos;
	MpRoboArm6Axis_0.Enable := TRUE;

	MpRoboArm6Axis_0.Override  := 100.0;
	RoboParameters.CoordSystem := 0; 
	RoboParameters.Velocity := 100; 
	RoboParameters.Acceleration := 1000; 
	RoboParameters.Deceleration := 1000; 
	RoboParameters.ProgramName := 'Robotic.st';  
	x;


END_PROGRAM

PROGRAM _CYCLIC
	
	P2up;
	P2 ;
	P1up ;
	P1 ;
	P0;
	HOME;
	PZ;
	A;
	
	RoboParameters.Jog.Velocity[0] := VelocityQ1;
	RoboParameters.Jog.Velocity[1] := VelocityQ2;
	RoboParameters.Jog.Velocity[2] := VelocityQ3;
	RoboParameters.Jog.Velocity[3] := VelocityQ4;
	RoboParameters.Jog.Velocity[4] := VelocityQ5;
	RoboParameters.Jog.Velocity[5] := VelocityQ6;
	    
	IF cartezianVSjog THEN 
		RoboParameters.Jog.CoordSystem := 10;
	ELSE			
		RoboParameters.Jog.CoordSystem := 0;
	END_IF
	

	IF MpRoboArm6Axis_0.Error THEN
		Step := ROBOTCTRL_ERROR; 
	END_IF;
		
	CASE Step OF
		
		ROBOTCTRL_DISABLED: 
			IF cmdTurnOn THEN
				cmdTurnOn := FALSE; 
				Step := ROBOTCTRL_POWER; 
			END_IF; 
		
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
			END_IF; 
		
		ROBOTCTRL_READY: 
			MpRoboArm6Axis_0.MoveProgram:=0;
			IF cmdTurnOff THEN
				cmdTurnOff := FALSE; 
			Step :=ROBOTCTRL_POWER_OFF;
			END_IF; 
 
			IF NOT(MpRoboArm6Axis_0.PowerOn) THEN
				Step := ROBOTCTRL_DISABLED; 
			END_IF;
			 
			IF cmdExecute THEN
				cmdExecute:=FALSE;
				Step := ROBOTCTRL_CHECK; // if cmdexecute is active robot starts procedure 
				
			END_IF;
		
		ROBOTCTRL_ERROR: 
			// Error handling 
			IF NOT(MpRoboArm6Axis_0.Error) THEN
				IF MpRoboArm6Axis_0.PowerOn THEN
					Step := ROBOTCTRL_READY; 
				ELSE
					Step := ROBOTCTRL_DISABLED; 
				END_IF; 
			END_IF; 
			
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
			END_IF;	
			
		ROBOTCTRL_POWER_OFF:	
			MpRoboArm6Axis_0.Power := FALSE; 
			IF NOT MpRoboArm6Axis_0.PowerOn THEN
				Step:=ROBOTCTRL_DISABLED;
			END_IF
			
		ROBOTCTRL_CALCULATE:
			//checking if any move is needed and if all moves are done 
			IF	P1P2_Ok THEN
				Step:=ROBOTCTRL_IS_MOVE_NEEDED;
			ELSIF y<IndexSize THEN
				Step:=ROBOTCTRL_CALCULATE_P1;
			ELSE 
				cmdExecute:=FALSE;
				Step:=ROBOTCTRL_READY;
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
			IF cmdTurnOff THEN
				cmdTurnOff := FALSE;
				Step:=ROBOTCTRL_POWER_OFF;
			END_IF; 
 
			
			IF cmdInterrupt OR MpRoboArm6Axis_0.MoveInterrupted THEN
				cmdInterrupt := FALSE; 
				Step:=ROBOTCTRL_INTERRUPT;
			END_IF; 
			
			IF cmdStop OR MpRoboArm6Axis_0.Stopped THEN
				cmdStop := FALSE; 
				Step:=ROBOTCTRL_STOP;
				
			END_IF; 
			//executing move procedure
			MpRoboArm6Axis_0.MoveProgram:=1;
			IF MpRoboArm6Axis_0.MoveDone THEN
				MpRoboArm6Axis_0.MoveProgram:=0;
				y:=y+1;
				P1P2_Ok:=0;
				Step:=ROBOTCTRL_CALCULATE;
			END_IF
			
		ROBOTCTRL_INTERRUPT:
			MpRoboArm6Axis_0.Interrupt:=TRUE; 
			IF cmdContinue AND MpRoboArm6Axis_0.MoveInterrupted THEN
				cmdContinue:=FALSE;
				MpRoboArm6Axis_0.Interrupt:=FALSE; 
				Step:=ROBOTCTRL_CONTINUE;
			END_IF
		
		ROBOTCTRL_CONTINUE:
			MpRoboArm6Axis_0.Continue:=1;
			IF  MpRoboArm6Axis_0.InMotion THEN
				MpRoboArm6Axis_0.Continue:=0;
				Step:=ROBOTCTRL_MOVE;
			END_IF
			
				
		ROBOTCTRL_STOP:
			MpRoboArm6Axis_0.Stop:=TRUE;
			IF MpRoboArm6Axis_0.Stopped THEN
				MpRoboArm6Axis_0.Stop:=FALSE;
				Step:=ROBOTCTRL_DISABLED;
				END_IF
			
			
		ROBOTCTRL_ERROR_WRONG_AIM:
			//handling wrong target error 
			IF cmdAck THEN
				cmdAck:=FALSE;
				Step:=ROBOTCTRL_READY;
			END_IF;




	END_CASE;	


	MpRoboArm6Axis_0.MpLink     := ADR(gAxesGroup_Racer3_1);
	MpRoboArm6Axis_0.Parameters := ADR(RoboParameters);
	MpRoboArm6Axis_0.Override := 100.0;
	MpRoboArm6Axis_0.Enable := TRUE;
	MpRoboArm6Axis_0();
	
	
	
END_PROGRAM


PROGRAM _EXIT
	MpRoboArm6Axis_0.Enable :=FALSE;
	MpRoboArm6Axis_0();
END_PROGRAM

			


