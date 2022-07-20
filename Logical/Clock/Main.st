
PROGRAM _INIT
	(* Insert code here *)
	 
END_PROGRAM

PROGRAM _CYCLIC
	 CASE STEP OF
	0:
			TON_0( IN:=TRUE, PT:=T#1s200ms );
			IF TON_0.Q THEN
				STEP := 1;
			END_IF
	1:
			TON_0( IN:=FALSE, PT:=T#1s200ms );
			IF NOT TON_0.Q THEN
				STEP := 0;
			END_IF
	END_CASE
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

