{
    init: function (elevators, floors) {
        const weight = 1.0;
        const maxFloor = floors.length-1;

        let distance = function( elevator, floorNum) {
            return Math.abs( elevator.currentFloor() - floorNum);
        }

        let findIdle = function( floorNum) {
            return elevators//.filter( (elevator) => (elevator.destinationQueue.length == 0))
                .sort( (a,b) => (distance(a, floorNum) - distance(b, floorNum)) );
        };

        let generateNewDestinationList = function(destinations){
            console.log(destinations.filter((destination) => (destination !== NaN)));
            let map = destinations.filter((destination) => (destination !== NaN)).reduce(function (p, c) {
                p[c] = (p[c] || 0) + 1;
                return p;
            }, {});
            console.log(map);
            let newTypesArray = Object.keys(map).sort(function (a, b) {
                return map[a] <= map[b];
            });

            return newTypesArray;
        }

        floors.forEach(function (floor) {
            floor.on("up_button_pressed", function () {
                // find an idle elevator if possible
                let choice = findIdle( floor.floorNum());
                console.log(choice);
                if (choice.length) {
                    choice[0].goToFloor( floor.floorNum());
                }
            });
            
            floor.on("down_button_pressed", function () {
                // find an idle elevator if possible
                let choice = findIdle( floor.floorNum());
                console.log(choice);
                if (choice.length) {
                    choice[0].goToFloor( floor.floorNum());
                }
            });
        });

        elevators.forEach(function (elevator, index) {
            // add an identifier to each elevator
            elevator.id = index;

            // event if elevator is doing nothing...
            elevator.on("idle", function () {

                // see if any floors have buttons pressed
                let demands = floors.filter((floor) => (floor.buttonStates.up || floor.buttonStates.down));

                let sortedDemand = demands.sort( (a,b) => (distance(elevator, a) - distance(elevator, b)) );

                // choose the first one
                if (sortedDemand.length) {

                    target = sortedDemand[0].floorNum();
                } else {
                    target = 0;
                }

                elevator.goToFloor(target);
            });

            // floor button pressed in elevator
            elevator.on("floor_button_pressed", function (floorNum) {
                let destinationList = generateNewDestinationList(elevator.getPressedFloors());
                let target = destinationList[0];
                elevator.goToFloor(target, true);
            });


            elevator.on("passing_floor", function (floorNum, direction) {
                console.log(floorNum);
                let floor = floors[floorNum];
                let pressed = elevator.getPressedFloors();
                let stop = floor.buttonStates[direction];// && elevator.loadFactor() < weight;
                // if we're going in the same direction as the button, we can stop
                if((pressed.indexOf( floorNum) >= 0)){
                    elevator.destinationQueue = elevator.destinationQueue.filter( (d) => (d !== floorNum));
                    elevator.goToFloor(floorNum, true);
                }else if (stop) {
                    // remove this floor from destinations
                    elevator.destinationQueue = elevator.destinationQueue.filter( (d) => (d !== floorNum));
                    elevator.checkDestinationQueue();
                    // no need to checkDestinationQueue as done in here...
                    //elevator.goToFloor(floorNum, true);
                }

            });

            elevator.on("stopped_at_floor", function (floorNum) {
                // do something here
                // control up and down indicators
                // TODO: control up down indicators better
                switch (floorNum) {
                    case 0:
                        up = true;
                        down = false;
                        break;
                    case maxFloor:
                        up = false;
                        down = true;
                        break;
                    default:
                        up = true;
                        down = true;
                        break;
                }
                elevator.goingUpIndicator(up);
                elevator.goingDownIndicator(down)
            });
        });

    }
    ,

        update: function (dt, elevators, floors) {
            // We normally don't need to do anything here
        }
}
