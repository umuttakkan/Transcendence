# Trans

venv ile pushlamak best practice hatasidir
(venv senin bilgisayarina gore calisiyor herkesin kendi venvini acmasi nolur nolmaz riskli olabilir.)
!! lutfen venv ile pushlamayin gereksiz agirlik yapiyor ve bilgisayardan bilgisayara degisim gosteriyor.
pushlamadan once make fclean yapin plis plis plis

Umut eger yeni bir module yukluyorsan 
```bash
    venv'i activate edip 
    pip list yap
    yukledigin modulun adini bulup requirements.txt'in icine <module_adi>==<volumu> seklinde yaz ki daha moduler calisabilelim.
    yardim edebilecegim bir konu var ise lutfen gorevlendir.
```
calistirmak icin sunu yapin pls

1-makefile ile (ez)
```bash
    make runserver
```

2-el ile
```bash
    python3 -m venv venv
```

mac icin
```bash 
    source venv/bin/activate
```

windows icin
```bash
    ./venv/Scripts/activate.bat
```

sonra requirements.txt kullanip:
```bash
    pip install --upgrade pip
    pip install -r requirements.txt
```

projeyi kaldirmak icin:
```bash
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver
```