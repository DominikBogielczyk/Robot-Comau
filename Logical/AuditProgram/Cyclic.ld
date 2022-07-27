PROGRAM _CYCLIC
<?xml version="1.0"?>
<?AutomationStudio FileVersion="4.9"?>
<!-- Automation Studio Generated XML Section -->
<networks maxcolumn="0">
	<network label="" comment="" row="9" column="0" commented="0">
		<row>
			<empty/>
			<empty/>
			<functionblock position="header" name="MpAuditTrail_0" type="MpAuditTrail"/>
			<empty/>
		</row>
		<row>
			<empty/>
			<contact type="address" name="gAuditTrail"/>
			<functionblock position="top" type="MpAuditTrail"><input name="MpLink" vardynamic="true"/><output name="Active"/></functionblock>
			<empty/>
		</row>
		<row>
			<empty/>
			<analog type="input" name="1"/>
			<functionblock position="middle" type="MpAuditTrail"><input name="Enable"/><output name="Error"/></functionblock>
			<empty/>
		</row>
		<row>
			<empty/>
			<empty/>
			<functionblock position="middle" type="MpAuditTrail"><input name="ErrorReset"/><output name="StatusID"/></functionblock>
			<empty/>
		</row>
		<row>
			<empty/>
			<empty/>
			<functionblock position="middle" type="MpAuditTrail"><input name="Language" vardynamic="true"/><output name="CommandBusy"/></functionblock>
			<empty/>
		</row>
		<row>
			<empty/>
			<contact type="address" name="'AuditDir'"/>
			<functionblock position="middle" type="MpAuditTrail"><input name="DeviceName" vardynamic="true"/><output name="CommandDone"/></functionblock>
			<empty/>
		</row>
		<row>
			<empty/>
			<empty/>
			<functionblock position="middle" type="MpAuditTrail"><input name="Export"/><output name="CurrentRecord"/></functionblock>
			<empty/>
		</row>
		<row>
			<empty/>
			<empty/>
			<functionblock position="middle" type="MpAuditTrail"><input name="ExportArchive"/><output name="ArchiveAvailable"/></functionblock>
			<empty/>
		</row>
		<row>
			<empty/>
			<empty/>
			<functionblock position="bottom" type="MpAuditTrail"><output name="Info"/></functionblock>
			<empty/>
		</row>
	</network>
	<network label="" comment="" row="2" column="0" commented="0">
		<row>
			<contact type="positive transition" name="TriggerEvent"/>
			<function position="top" type="MpAuditClearBuffer"><input name="EN" ENO="true"/><output name="ENO" ENO="true"/></function>
			<empty/>
		</row>
		<row>
			<analog type="input" name="gAuditTrail"/>
			<function position="bottom" type="MpAuditClearBuffer"><input name="MpLink"/><output name="4"/></function>
			<analog type="output" name="Status"/>
		</row>
	</network>
</networks>
END_PROGRAM






