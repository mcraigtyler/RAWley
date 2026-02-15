# Tic-Tac-Toe - Rules

## Game Board
The game board is a 3x3 grid where a `.` indicates an open position:
```
...
...
...
```

## Rules
- Each player is represented by either an `x` or an `o`
- Each player takes turns playing their piece on the board in an open space `.`
- The player with the `x` pieces goes first
- A random player is chosen to play the `x` pieces first. Each successive game palyers swap being the `x` or `o`

- The first player to get 3 of their pieces in a line wins.
- A line can be horizontal, vertical or diagonal.

## Example Winning Game States

### `o` wins - horizontal
ooo
.xx
..x

### `x` wins - vertical
xoo
x..
x..

## `o` wins - diagonal
o..
xox
x.o

## `x` wins - horizontal
oxo
xxx
o..

## Action Notation
On a players turn they will signify where they want to place their token by indicating the row,col of the desired location.

- 0,0 signifies the top left position
- 2,2 signifies the bottom right position
