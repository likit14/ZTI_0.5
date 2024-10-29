 docker-compose down
 docker rmi $(docker images -aq)
 docker volume remove zti_05_mysql-data 
 docker volume remove zti_05_shared-data 

