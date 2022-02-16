# Structure Production

## Self sufficient material production

To produce self sufficient materials, the following structures are needed:

**Note:** `*` - optional, to sell

Structures:

| Type                | Consumes                               | Produces                          |
| ------------------- | -------------------------------------- | --------------------------------- |
| Fuel Refinery\*     | Drones, Machinery                      | Fuel                              |
| Farm\*              | Machinery                              | Food                              |
| Shipyard\*          | Metals, Machinery, Electronics, Drones | Ship Parts, Ship Plating          |
| Drone Factory       | Metals, Electronics                    | Drones                            |
| Fabrication Plant   | Metals, Chemicals, Drones              | Machinery, Construction Materials |
| Mine                | Machinery, Explosives                  | Metals                            |
| Electronics Factory | Rare Metals, Chemicals                 | Electronics                       |
| Chemical Plant      | Drones                                 | Chemicals                         |
| Explosives Facility | Chemicals                              | Explosives                        |
| Rare Earth Mine     | Machinery, Explosives                  | Rare Metals                       |

Direction:

| Type                | From                                                        | To                                                                |
| ------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| Fuel Refinery\*     | Drone Factory, Fabrication Plant                            | **Sell**                                                          |
| Farm\*              | Fabrication Plant                                           | **Sell**                                                          |
| Shipyard\*          | Mine, Fabrication Plant, Electronics Factory, Drone Factory | **Sell**                                                          |
| Drone Factory       | Mine, Electronics Factory                                   | Fuel Refinery\*, Shipyard\*, Chemical Plant                       |
| Fabrication Plant   | Mine, Chemical Plant, Drone Factory                         | Fuel Refinery\*, Farm\*, Shipyard\*, Mine, Rare Earth Mine        |
| Mine                | Fabrication Plant, Explosives Facility                      | Shipyard\*, Drone Factory, Fabrication Plant, Electronics Factory |
| Electronics Factory | Rare Earth Mine, Chemical Plant                             | Shipyard\*, Drone Factory                                         |
| Chemical Plant      | Drone Factory                                               | Fabrication Plant, Electronics Factory, Explosives Facility       |
| Explosives Facility | Chemical Plant                                              | Mine, Rare Earth Mine                                             |
| Rare Earth Mine     | Fabrication Plant, Facility                                 | Electronics Factory                                               |

Ship routes (not optimised):

```
* Mine -> Shipyard -> SELL -> START
```

```
* Mine -> Drone Factory -> Shipyard -> SELL -> START
```

```
* Mine -> Drone Factory -> Chemical Plant -> Fabrication Plant -> Shipyard -> SELL -> START
```

```
* Mine -> Drone Factory -> Chemical Plant -> Electronics Factory -> Shipyard -> SELL -> START
```

```
* Mine -> Drone Factory -> Fuel Refinery -> SELL -> START
```

```
* Mine -> Drone Factory -> Fuel Refinery -> SELL -> START
```

```
* Mine -> Drone Factory -> Chemical Plant -> Fabrication Plant -> Fuel Refinery -> SELL -> START
```

```
* Mine -> Drone Factory -> Chemical Plant -> Fabrication Plant -> Farm -> SELL -> START
```

```
Mine -> Drone Factory -> Chemical Plant -> Fabrication Plant -> START
```

```
Mine -> Drone Factory -> Chemical Plant -> Fabrication Plant -> Rare Earth Mine -> Electronics Factory -> START
```

```
Mine -> Drone Factory -> Chemical Plant -> Electronics Factory -> START
```

```
Mine -> Drone Factory -> Chemical Plant -> Explosives Facility -> START
```

```
Mine -> Drone Factory -> Chemical Plant -> Explosives Facility -> Rare Earth Mine -> Electronics Factory -> START
```

```
Mine -> Fabrication Plant -> START
```

```
Mine -> Fabrication Plant -> Rare Earth Mine -> Electronics Factory -> START
```
