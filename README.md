# paragliding-task-checker
A very simple tool to check paragliding tasks.  View at https://scottyob.github.io/paragliding-task-checker/

## Rules
* Did you launch after the window if set
* Were you inside the start cylinder at the start time or did you reenter it before going to the first waypoint?
* Did you then enter the waypoints in order?
* Did you then enter the ESS before the ESS deadline is set?
* Did you then enter the goal cylinder before the Goal deadline if set?

## About
Feel free to modify.  At the moment, assumes start time SSS, and that we're just entering cylinders.  Also ignores all height
Mostly as I have no idea how anything else works.

## Developing

Guide to setting up on Ubuntu

1. Setup nvm
```
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash 
# (logout and in as our bash profile has changed)
nvm install --lts

npm install
npm start
```