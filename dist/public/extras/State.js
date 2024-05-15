export var State;
(function (State) {
    State[State["Running"] = 0] = "Running";
    State[State["Paused"] = 1] = "Paused";
    State[State["Dead"] = 2] = "Dead";
    State[State["Idle"] = 3] = "Idle";
})(State || (State = {}));
