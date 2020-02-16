'use strict'

/*******************************************************************************
 * Used to configure demo data and injection data
 ******************************************************************************/

 var acove = {
     defaults: {}
 }

// Default configurations for demo
acove.defaults.demo = {
		
	// Timer Defaults:
    // this is the start date of the demo.
    // Starting on Oct 5, 08:00, 2017
    //(year, month, day, hours, minutes, seconds, milliseconds)
    now: new Date(),    //new Date(2017, 9, 5, 8, 0, 0, 0),

    // Timer index to begin on
    timerUpdateIndex: 0,

    // how long between timer steps in milliseconds
    timerIntervalInMS: 5000,

    // Base amount of mintuest to add per step of the timer
    timerMinuteStepPerUpdate: 15,
    
    //number of days in past for data
    dayCount: 2, 

    // set to false if no internet connection
    isOnline: true,

    // map settings (most not used yet)
    useGeoMap : false,
    arcgis_webmercator_map_server_url : "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
    arcgis_geographic_map_server_url : "http://services.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer",

    // center of map to start
    mapCenter : [ 37.177241, 36.199684 ],

    // default zoom max
    defaultMapZoom : 12,

    // min/max for random data
    //latitude : [ 25.393661, 35.380093 ],

    // min/max for random data
    //longitude : [ -105.996094, -92.636719 ],

    // set the number of parallel threads for image generation in report gen
    reportThreadLimit: 100,

    // set report type, options: 
    // "html" "powerpoint"
    reportTypes: ["powerpoint"], // may want to add constants?

    friendlyArrivalAge: 4, // number of hours for random age of friendly/objective created date

    // min/max for engagement lengths
    minStart : -120*60, // not currently used
    maxStart : 120*60, // not currently used
    minRecon :  0,
    minReconLength : 30,
    minManeuver : 0,
    minFight : 30,

    // Minutes min/max for Hostile recon length
    reconLengthRange : [30, 120],
    
    // Confidence for indicators
    confidenceRange : [30, 100],

    // Areas Of Interest
    // areasOfInterest : [
    //         {
    //             id : 1,
    //             name : "Aleppo",
    //             latitude:[36.04754449739744,36.35406631984],
    //             longitude:[36.95379640907049,37.37814333289862],
    //             footprint : [[4119002.230978188,4351707.966395143],[4135971.251257474,4357287.869459953],[4156838.559979299,4354383.262385121],[4167463.3069109246,4341465.4046049435],[4168380.5512503455,4324649.258382227],[4161959.840874399,4306380.808622095],[4137347.1177666057,4298660.668765303],[4115562.5647053597,4301565.275840135],[4106007.9361697254,4317999.236921426],[4105167.1288585896,4341847.589746369],[4119002.230978188,4351707.966395143]] 
    //         } ],

    // areasOfInterest: (MCOOArea.areasOfInterest && MCOOArea.areasOfInterest.length > 0) ? MCOOArea.areasOfInterest : [],
    
    // Landmarks (if friendlies or objectives fall in region, then landmark
    // reference added)
    landmarks : [
            {
                id : 1,
                name : "Aleppo Intl Airport",
                path : [[4142495.3840468563,4327203.46387447],[4148228.1611682368,4327107.917589114],[4148381.0352248065,4324776.588226419],[4141922.106334718,4324776.588226419],[4142495.3840468563,4327203.46387447]]
            
            },
            {
                id : 2,
                name : "Stadium",
                path : [[4132062.3729370516,4326271.474734533],[4132138.8099653367,4326175.928449176],[4132138.8099653367,4325889.289593107],[4131966.826651695,4325831.961821893],[4131794.8433380537,4325984.835878463],[4131813.952595125,4326290.583991604],[4132062.3729370516,4326271.474734533]]
            } ,
            {
                id : 3,
                name : "Citadel",
                path : [[4136648.5946341436,4328182.400441653],[4136858.7964619277,4328316.165241152],[4137202.7630892103,4328316.165241152],[4137298.3093745667,4328182.400441653],[4137317.418631638,4328048.635642154],[4137260.090860424,4327895.761585584],[4137183.653832139,4327857.543071441],[4137011.670518498,4327800.2153002275],[4136858.7964619277,4327781.106043156],[4136744.1409195,4327857.543071441],[4136629.4853770724,4328029.526385083],[4136648.5946341436,4328182.400441653]]
            } ],

    // # of randoms to start for each area of interest
    objectiveCount : 1,
    friendlyCount : 1,
    hostileCount : 3,
    neutralCount : 2,
        
    // Unit Types
    unitTypes: [
                { value: 'infantry', name: 'Infantry/Rifle', multiplier: 0.4, weaponsRange: 0.25, reconDuration: 2 * 60, useReconTravel: true}, // not sure if this is how we want to do recon travel
                { value: 'cavalry', name: 'Recon/Cavalry', multiplier: 0.2, weaponsRange: 0.25, reconDuration: 0, useReconTravel: false },
                { value: 'artillery', name: 'Fires/Artillery', multiplier: 0.8, weaponsRange: 40, reconDuration: 0, useReconTravel: false },
                //{ value: 'missile', name: 'Missile', multiplier: 1.0, weaponsRange: 40 },
                { value: 'armor', name: 'Armor/Tank', multiplier: 0.7, weaponsRange: 2.5, reconDuration: 1 * 60, useReconTravel: true },
                { value: 'combined', name: 'Combined Arms', multiplier: 0.9, weaponsRange: 2.5, reconDuration: 2 * 60, useReconTravel: true },
                { value: 'special', name: 'Special Forces', multiplier: 0.6, weaponsRange: 1, reconDuration: 0, useReconTravel: false }
                //{ value: 'unknown', name: 'Unknown', multiplier: 0.5, weaponsRange: 2.5 }
    ],
    
    // Mobility TODO add types that are supported to not have crazy combos??
    mobility: [
        { value: 'dismounted', name: 'Dismounted', speed: 3, reconSpeed: 3 },
        { value: 'tracked', name: 'Mech Tracked', speed: 10, reconSpeed: 10 },
        { value: 'wheeled', name: 'Mech Wheeled', speed: 20, reconSpeed: 20 },
    ],
    
        
    // Unit Sizes
    unitSizes: [
                { value: 'squad', name: 'Squad/Team', multiplier: 0.5, speedMultiplier: 1.0, engagementLength: 0.5 * 60, reconDuration: 1 * 60, footprint: 10  }, 
                { value: 'patrol', name: 'Section/Patrol', multiplier: 1.0, speedMultiplier: 1.0, engagementLength: 1.0 * 60, reconDuration: 1 * 60, footprint: 30 },
                { value: 'platoon', name: 'Platoon/Flight', multiplier: 1.25, speedMultiplier: 1.0, engagementLength: 2.0 * 60, reconDuration: 2 * 60, footprint: 50 },
                { value: 'company', name: 'Company/Battery/Troop', multiplier: 1.5, speedMultiplier: 0.9, engagementLength: 4.0 * 60, reconDuration: 4 * 60, footprint: 300 },
                { value: 'battalion', name: 'Battalion/Squadron', multiplier: 2.0, speedMultiplier: 0.8, engagementLength: 8.0 * 60, reconDuration: 8 * 60, footprint: 1500 },
                { value: 'brigade', name: 'Brigade/Wing', multiplier: 3.0, speedMultiplier: 0.5, engagementLength: 12.0 * 60, reconDuration: 12 * 60, footprint: 3000 },
                { value: 'regiment', name: 'Regiment', multiplier: 2.5, speedMultiplier: 0.6, engagementLength: 12.0 * 60, reconDuration: 12 * 60, footprint: 6000 },
                { value: 'division', name: 'Division/Legion', multiplier: 4.0, speedMultiplier: 0.3, engagementLength: 24.0 * 60, reconDuration: 24 * 60, footprint: 10000 }
               // { value: 'unknown', name: 'Unknown', multiplier: 2.0, speedMultiplier: 1.0, engagementLength: 6.0 * 60 }
    ],

    // exclude the listed, all for everything....
    // can change to use something more like unit sizes instead of property names...
    unitSelectRestrictions: {
        infantry: { mobility: [], sizes: [] },
        cavalry: { mobility: [], sizes: ['brigade', 'regiment', 'division'] },
        artillery: { mobility: [], sizes: [] },
        armor: { mobility: ['dismounted'], sizes: [] },
        combined: { mobility: ['dismounted'], sizes: [] },
        special: { mobility: [], sizes: ['platoon', 'company', 'battalion', 'brigade', 'regiment', 'division'] }
        // missile: { mobility: ["all"], sizes: ['all'] },
        // unknown: { mobility: ["all"], sizes: ['all'] },
    },

        
    hostileNames: ['Russian 77th','Russian 109th','Russian 58th','Syrian 100th','Syrian 103rd','Russian 21st','Syrian 105th','Syrian 101st','Russian 45th','Russian 53rd','Syrian 4th','Syrian 106th','Syrian 124th'],

    friendlyNames: ['TF Red Buffalo','TF White Chrome','Grey Mirror','Green Blizzard','Black Cat','Super Sixth','Steel Viper','Brass Olive','Copper Bolt' ,'Purple Phantom','Silver Boa',' Python','Steel Turtle King', 'Desert Strike'],

    objectiveNames: ['Great Eagle','Golden Scarab','Cool Hawk','Crystal Skull','Electric Slide','Crimson Tango','Weeping Angel','Judas Staff','Silver Goose'],

    neutralNames: [ "Neutral-1","Neutral-2","Neutral-3" ],
     
    commanders: [
                { unitSize: 'squad', names: ['SSgt. Crunch','SSgt. Reynolds','SSgt. Solo','SSgt. Landa','SSgt. Austin','SSgt. Rico','SSgt. Kellerman','SSgt. Casey','SSgt. Trautman'] },
                { unitSize: 'patrol', names: ['Sgt. Eisenhower','Sgt. Custer','Sgt. Jackson','Sgt. Rogers','Sgt. Kirk','Sgt. Adams','Sgt. Morgan'] },
                { unitSize: 'platoon', names: ['Lt. Connor','Lt. Creswell','Lt. MacArthur ','Lt. White','Lt. Talbot','Lt. Wilson','Lt. Simmons','Lt. McKenzie'] },
                { unitSize: 'company', names: ['Major John','Captain Sully','Major Phillips','Captain Haddock','Major Sparrow','Captain Jones','Captain Ahab','Major Nemo'] },
                { unitSize: 'battalion', names: ['Lt. Colonel Sanders','Lt. Colonel Mustard','Lt. Colonel Parker','Lt. Colonel Burton','Lt. Colonel Danvers','Lt. Colonel Fury','Lt. Colonel Ross','Lt. Colonel O’Neil','Lt. Colonel Stryker','Lt. Colonel Trevor'] },
                { unitSize: 'brigade', names: ['BGen. Anthony','BGen. Mustang','BGen. Raynor','BGen. Ridley','BGen. Colton','BGen. Eiling','BGen. Turnbull','BGen. West','BGen.  Hammond'] },
                { unitSize: 'regiment', names: ['Colonel Green','Colonel Hill','Colonel Mayer','Colonel Mitchell','Colonel Renwick','Colonel Tracy','Colonel Santos','Colonel Sheppard','Colonel Carter'] },
                { unitSize: 'division', names: ['Major General Jose','Major General Stewart','Major General Revan','Major General Maverick','Major General Holden'] }
               
    ],
    
    callSigns: ['Max Steel','Cobalt','Hark Ranger','Cash','Cricket','Green Goblin','Geronimo','Virgo ','Colossus','Halmark','Calypso','Blue Beatle ','Navaho','Tin Slinger','Black Spider','Red Delta','Firefly','Serenity ','Orangutan'],
    
    otherEEFIs: ['Watermelon', 'Cloud', 'Raptor', 'Snake', 'Alfred', 'Batman'],
    
    c2Words: [
              { value: 'deploy', description: 'The adversary gave a deploy command'},
              //{ value: 'americans', description: 'They adversary is talking about americans'},
              { value: 'mobilize', description: 'The adversary gave mobilize command'},
              { value: 'attack', description: 'The adversary gave an attack command'},
              { value: 'advance', description: 'The adversary gave an advance command'},
              { value: 'intrude', description: 'The adversary gave an intrude command'},
              { value: 'launch', description: 'The adversary gave an launch command'},
              { value: 'charge', description: 'The adversary gave a charge command'},
              { value: 'seize', description: 'The adversary gave a seize command'},
              { value: 'blitz', description: 'The adversary gave a blitz command'},
              { value: 'rush', description: 'The adversary gave a rush command'},
              { value: 'storm', description: 'The adversary gave a storm command'},
              { value: 'fire', description: 'The adversary gave a fire command'}
              ],
              
    generalThreatWords: [
              { value: 'americans', description: 'The adversary is talking about US troops'},
              //{ value: 'ISIS', description: 'real bad'},
              //{ value: 'crash', description: 'oops'},
              //{ value: 'drone', description: 'Things that fly'},
              //{ value: 'rebels', description: 'good or bad?'}
              ],

    readinessTypes: [
                     { value: 'Artillery', description: 'Artillery fire detected'},
                     //{ value: 'Rifle', description: 'Rifle fire detected'},
                     //{ value: 'IED', description: 'IED detected'},
                     //{ value: 'Rocket', description: 'Rocket fire detected'},
                     { value: '# People', description: 'The number of people detected at the adversary location increased'},
                     //{ value: 'Unknown', description: 'Unknown fire detected'},
                     { value: 'Comms', description: 'Communication activity increased'},
                     { value: 'Mvmt', description: 'People and equipment movement at adversary location increased'},
                     { value: 'Ammo', description: 'Additional ammo detected at adversary location'},
                     { value: 'Formation', description: "The adversary's equipment is seen in an attack formation"}
                     ],

    // create manual indicator every n indicator (0 for never)
    manualEEFIIndicator: 0,
    manualC2Indicator: 0,
    manualManueverIndicator: 0,
    manualReadinessIndicator: 0,
    
    // # of combat readiness indicators to add to random hostile on start
    combatReadinessCount: 2,
    
    // # of combat readiness indicators to add to a newly added hostile via add button
    combatReadinessForAddedHostileCount: 2,
    
    maneuverTypes: [
                    { value: 'Position', description: "The adversary's newly assessed position is closer to friendly unit than the previous position.", isSingle: true },
                    { value: 'Mvmt', description: 'The adversary is moving, direction unknown', isSingle: true },
                    //{ value: 'Pos Unk', description: 'Position Unknown', isSingle: false },
                    { value: 'Formation', description: "The adversary's equipment is seen in an attack formation", isSingle: false },
                    { value: 'Fuel', description: 'Re-fueling activities seen at the adversary location', isSingle: false }

                    ],
    
    // # of combat readiness indicators to add to random hostile on start
    maneuverCount: 30,
    
    // # of combat readiness indicators to add to hostile added using add button
    maneuverForAddedHostileCount: 0,
    
    // # of threat words to add to a hostile during initial data load
    threatWordCount: [0, 1],
    
    // # of threat words to add to a hostile on new hostile addition
    threatWordForAddedHostileCount: [0, 0],

    // # of findings to add to a threat on initial data load
    findingsForThreat: [0, 0],
    
    // # of hostiles to tie a new unit's threat words to when a new friendly/objective added
    hostileCountForNewFriends: [2, 2],
    
    // # of c2 words to add to a hostile during initial data load
    c2WordCount: [0, 0],
    
    // # of threat words to add to a hostile on new hostile addition
    c2WordForAddedHostileCount: [0, 0],

    // PER STEP UPDATES
    // # of threat words to add per step of demo time
    threatWordsPerStep: [0, 1],

    // # of c2 words to add per step of demo time
    c2WordsPerStep: [0, 1],

    // # of readiness indicators to add per step of demo time
    readinessPerStep: [0, 1],

    // # of maneuver indicators to add per step of demo time
    maneuverPerStep: [0, 1],

    // Returns the default time interval step defined in
    // acc.timer.minuteStepPerUpdate
    // OR another value if defined (in minutes)
    getMinuteStepForUpdate : function(step) {

        // IF WE NEED A BIG JUMP - Step n jumps n hours
        // if (step === 3) {
        // return 60 * n;
        // }

        return acove.timer.minuteStepPerUpdate
    },

    // Returns the default time interval defined in acc.timer.intervalInMS
    // OR another value if defined (in milliseconds)
    getIntervalForUpdate : function(step) {

        // this covers all steps above 11.
        // if (step > 11 && step < 15) {
        //if (step > 11) {
        //    return 500;
        //}

        // if you want to set specific steps, you can do this (as long as step
        // does not meet a previous condition)
        // if (step === 2) {
        // return 500;
        // }

        // console.log("returning default interval", acc.timer.intervalInMS);
        return acove.timer.intervalInMS;
    },

    // all the data manually added on startup
    initialData : function() {
        var self = this;
    },

    updateData : function(updateIndex) {
        console.log("Updating Data at step " + updateIndex);
        var manual = acove.defaults.manual;

        var objective = null,
            friendly = null,
            hostile = null,
            neutral = null,
            summary = "";

        // do inject for all
        summary = acove.model.injectDataForEachStep(summary);

        var self = this;

        // Each case is a new step
        // Add particular units, objectives and indicators in each step
        // update the summary with a summary to display after the update
        switch (updateIndex) {
        case 1:
        	summary += "<br>* EEFI Detected"
            //summary += "<br>* Added a new Friendly, Hostile, & Objective, plus 4 Indicators (1 of each type)"
            console.log("Update " + updateIndex + " - " + summary);

        	/*
            // add a new friendly unit
            acove.model.addFriendlyUnit({
                id: manual.friendlyId++,
                name: "Mark 88",
                callSigns: [ "Max Steel", "Max Steel III" ],
                commanderNames: [ "Mark", "Brian" ],
                otherEEFIs: [],
                inFocus: true,
                lat: 36.199684,
                lng: 37.177241,
                mobility: acove.model.getMobilityByValue('wheeled'),
                size: acove.model.getSizeByValue('patrol'),
                type: acove.model.getTypeByValue('armor'),
                created: acove.model.addMinutes(acove.model.demoNow, -60) // add negative units for to put units in the past
            });

            // add a new hostile unit
            acove.model.addHostileUnit({
                id: manual.hostileId++,
                name: "Fire and Fury",
                mobility: acove.model.getMobilityByValue('wheeled'),
                size: acove.model.getSizeByValue('platoon'),
                type: acove.model.getTypeByValue('cavalry'),
                lat: 35.356134811824184,
                lng: 36.42757977138429,
            }, manual.areaId, true );

            // add a new objective
            // ** This will not work if the friendly unit with the specified name does not exist
            acove.model.addObjective({
                id: manual.objectiveId++,
                name: "Objective 2",
                friendlyUnitName: "Mark 88",
                lat: 36.260607472115346,
                lng: 36.9,
            });

            // add a manual indicator for each type
            // parameters in order
            // acove.model.addIndicator(category, hostileName, type, manualDate);
            // category: category id of indicator to add
            // hostileName: name of hostile to add indicator
            // type: type of indicator to add
            // manualDate: time to add indicator
            acove.model.addIndicator("E", "Fire and Fury");
            acove.model.addIndicator("C2", "Fire and Fury");
            acove.model.addIndicator("R", "Fire and Fury", "Rifle", '02/27/2018 1:30:00');
            acove.model.addIndicator("M", "Fire and Fury", 'Position', '02/27/2018 1:30:00');
            acove.model.addIndicator("R", "Fire and Fury", false, '02/27/2018 1:30:00');
            acove.model.addIndicator("M", "Fire and Fury");
            
            acove.model.addIndicator("E", "Fire and Fury", "Mark Test");
            acove.model.addIndicator("E", "Fire and Fury", "Mark Test Not Here");
            
            acove.model.addIndicator("E", "Fire and Fury", "Objective 1");
            */
            acove.model.addIndicator("E", "Russian Artillery Brigade", "Aleppo Intl Airport");

            break;

        case 2:
            //summary += "<br>* Update a Friendly, Objective, & Hostile";
        	summary += "<br>* No Indicators Detected"
        	console.log("Update " + updateIndex + " - " + summary);

        	/*
            // update friendly unit (location and unit info)
            friendly = acove.model.getFriendlyByName("Mark Inject Test");
            friendly.lat = 36.19968;
            friendly.lng = 37.1771;
            friendly.mobility = acove.model.getMobilityByValue('dismounted');
            friendly.size = acove.model.getSizeByValue('patrol');
            friendly.type = acove.model.getTypeByValue('special');

            // update another friendly (location and name and commander)
            friendly = acove.model.getFriendlyByName("Mark Test");
            friendly.lat = 36.21;
            friendly.lng = 37.166;
            friendly.commanderNames = [ "Major General Jose III" ];
            friendly.name = "Maddog Gunners";

            // update an objective (name and associated friendly)
            objective = acove.model.getObjectiveByName("Objective 1")
            objective.name = "Bold Strategy, Cotton";
            objective.friendly =  acove.model.getFriendlyByName("Maddog Gunners");

            //update a hostile (name, unit info, and location)
            hostile = acove.model.getHostileByName("MARK STUFF")
            hostile.name = "The Shark Unit";
            hostile.size =  acove.model.getSizeByValue('brigade');
            hostile.type = acove.model.getTypeByValue('armor');
            hostile.lat = 36.23;
            hostile.lng = 37.15;
			*/
            break;
       
        case 3:
        	summary += "<br>* EEFI Detected"
            console.log("Update " + updateIndex + " - " + summary);

        	acove.model.addIndicator("E", "Syrian 3rd", "americans");
        	
            break;
            
        case 4:
            summary += "<br>* C2 Detected"
            console.log("Update " + updateIndex + " - " + summary);
	
	            acove.model.addIndicator("C2", "Syrian 3rd", "Prepare");
	
			break;
			
		case 5:
            summary += "<br>* No Indicators Detected"
            console.log("Update " + updateIndex + " - " + summary);
	
			break;
			
		case 6:
            summary += "<br>* No Indicators Detected"
            console.log("Update " + updateIndex + " - " + summary);
	
			break;
						
			
		case 7:
            summary += "<br>* Readiness Detected"
            console.log("Update " + updateIndex + " - " + summary);
	
            acove.model.addIndicator("R", "Russian Artillery Brigade", "Comms");
			acove.model.addIndicator("R", "Russian Artillery Brigade", "Ammo");
	
			break;

		case 8:
            summary += "<br>* Maneuver and Readiness Detected"
            console.log("Update " + updateIndex + " - " + summary);
				
            //add manuever indicator
            acove.model.addIndicator("M", "Syrian 3rd", "Position");
            acove.model.addIndicator("R", "Syrian 3rd", "Mvmt");
			
            // //update unit position
			// hostile = acove.model.getHostileByName("Syrian 3rd")
			// hostile.lat = 36.10;
       		// hostile.lng = 37.081;
			
			break;

		// This is duplicate case 3....
		/*
		case 3:
            summary += "<br>* C2 Detected"
            console.log("Update " + updateIndex + " - " + summary);
	
	            acove.model.addIndicator("C2", "Russian Artillery Brigade", "launch");
	
			break;
		*/
        
		
        default:
            console.log("Update " + updateIndex + " - No manual updates.");
            summary += "";
            break;
        }

        return summary;
    }

}


// Initial Start up - Manual Unit Placements for demo, assume using same area of Interest
acove.defaults.manual = {
    areaId : 1,    //exists in acove.defaults.demo.areasOfInterest;    
  
    friendlyId: 1000,
    hostileId: 1000,
    objectiveId: 1000,
    neutralId: 1000,

    addFriendlyUnits: function() {
        var self = this;
        var friendlyUnits = [];

        // Add as many friendlies as you want following pattern below...
        
        /*
        friendlyUnits.push({
            name: "Mark Test",
            callSigns: [ "Max Steel Jr." ],
            commanderNames: [ "Major General Jose" ],
            otherEEFIs: [],
            inFocus: true,
            lat: 35.579214775323706,
            lng: 36.176542480368,
            mobility: acove.model.getMobilityByValue('wheeled'),
            size: acove.model.getSizeByValue('patrol'),
            type: acove.model.getTypeByValue('infantry'),
            missionStatement: "",
            informationRequirements: [],
            created: acove.model.addMinutes(acove.model.demoNow, -60)
        });
        
        friendlyUnits.push({
            name: "Mark other Test",
            callSigns:  [ "Oakey Maximus" ],
            commanderNames: [ "Lt. Colonel Fury" ],
            otherEEFIs: [],
            inFocus: true,
            lat: 35.5,
            lng: 36.0,
            mobility: acove.model.getMobilityByValue('tracked'),
            size: acove.model.getSizeByValue('brigade'),
            type: acove.model.getTypeByValue('armor'),
            missionStatement: "",
            informationRequirements: [],
            created: acove.model.addMinutes(acove.model.demoNow, -120)
        });
        */
        // set up ids and calculated stuff
        // friendlyUnits.forEach(function (friendly) {
        //     friendly.id = "F-" + self.friendlyId++;

        //     var landmarks = acove.model.getOverlapLandmarks(friendly.lat, friendly.lng);
        //     friendly.landmarks = landmarks;

        //     var combatPower = acove.calculator.combatPower(friendly.size, friendly.type);
        //     friendly.combatPower = combatPower;
            
        //     //add to model
        //     acove.model.friendlyUnits.push(friendly);
            
        //     // Add commander and call signs to lookup by area of interest
        //     var commandersIndex = findIndexByValue(acove.model.commanders, "areaId", self.areaId);
        //     var areaCommanders = acove.model.commanders[commandersIndex];
        //     var commanders = areaCommanders.commanders;
            
        //     if ($.inArray(friendly.commanderName, commanders) == -1) {
        //         commanders.push(friendly.commanderNames[0]);
        //     }
            
        //     var callSignsIndex = findIndexByValue(acove.model.callSigns, "areaId", self.areaId);
        //     var areaCallSigns = acove.model.callSigns[callSignsIndex];
        //     var callSigns = areaCallSigns.callSigns;
            
        //     if ($.inArray(friendly.callSigns[0], callSigns) == -1) {
        //         callSigns.push(friendly.callSigns[0]);
        //     }
            
        //     // Add threat words for unit
        //     var unitThreatWords = acove.model.buildThreatWordsForUnit(self.areaId, friendly, "friendly");
        //     console.log("Added threat words for initial friendly", friendly, unitThreatWords);
        // });
        
    },
    
    addObjectives: function() {
    //     var self = this;
    //     var objectives = [];
    //     var friendlyUnits = acove.model.friendlyUnits;

    //     /*
    //     objectives.push({
    //         name: "Objective 1",
    //         friendlyUnitName: "Mark Test",      // Make sure friendly name was added previously
    //         lat: 36.260607472115346,
    //         lng: 37.47256772007005,
    //         created: acove.model.addMinutes(acove.model.demoNow, 0)
    //     });
    //     */
        
    //     objectives.forEach(function(objective, i) {
    //         objective.id = "O-" + self.objectiveId++;
            
    //         var landmarks = acove.model.getOverlapLandmarks(objective.lat, objective.lng);
    //         objective.landmarks = landmarks;

    //         var friendlyIndex = findIndexByValue(friendlyUnits, "name", objective.friendlyUnitName);

    //         if (friendlyIndex < 0) {
    //             // This means the friendly name used above was not found, not going to use this objective
    //             return;
    //         }
            
    //         objective.friendlyUnit = friendlyUnits[friendlyIndex];

    //         //add to model
    //         acove.model.objectives.push(objective);
            
    //         // Add threat words for unit
    //         var unitThreatWords = acove.model.buildThreatWordsForUnit(self.areaId, objective, "objective");
    //         console.log("Added threat words for initial objective", objective, unitThreatWords);
    //     });
    },
    
    
    addNeutralUnits: function() {
        // var self = this;
        // var neutralUnits = [];
        // var id = self.neutralId;
        
        // neutralUnits.push({
        //     id: id,
        //     name: "name",
        //     mobility: acove.model.getMobilityByValue('wheeled'),
        //     size: acove.model.getSizeByValue('platoon'),
        //     type: acove.model.getTypeByValue('cavalry'),
        //     lat: 35.356134811824184,
        //     lng: 36.42757977138429,
        // });
        
        // neutralUnits.forEach(function(unit) {
        //     acove.model.addNeutralUnit(unit);
        // });

    },
    
    
    addHostileUnits: function() {
        var self = this;
        var hostileUnits = [];
        
        /*
        hostileUnits.push({
            id: self.hostileId++,
            name: "MARK STUFF",
            lat: 35.770761359721305,
            lng: 37.13571665666224,
            mobility: acove.model.getMobilityByValue('wheeled'),
            size: acove.model.getSizeByValue('patrol'),
            type: acove.model.getTypeByValue('infantry'),
        });
        */
        
        // hostileUnits.push({
        //     id: self.hostileId++,
        //     name: "Russian Artillery Brigade",
        //     lat: 36.34569871236542,
        //     lng: 37.05111164412121,
        //     mobility: acove.model.getMobilityByValue('wheeled'),
        //     size: acove.model.getSizeByValue('brigade'),
        //     type: acove.model.getTypeByValue('artillery'),
        // });
		
        // hostileUnits.push({
        //     id: self.hostileId++,
        //     name: "Syrian 3rd",
        //     lat: 36.05165487446354,
        //     lng: 37.07648354681564,
        //     mobility: acove.model.getMobilityByValue('dismounted'),
        //     size: acove.model.getSizeByValue('brigade'),
        //     type: acove.model.getTypeByValue('infantry'),
        // });
        
        // hostileUnits.forEach(function (hostile) {
        //   acove.model.addHostileUnit(hostile, self.areaId, false);  
        // })
        
    }

}
