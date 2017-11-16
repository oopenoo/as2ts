@echo off
call python as2ts_util.py movedir "hello_TS" _index.json

:END
@echo Ending ...
ping 128.0.0.1 -n 1 -t 5000 > nul
goto:EOF

