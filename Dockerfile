FROM node:latest
MAINTAINER linmadan <772181827@qq.com>
COPY ./package.json /home/gridvo-mosca/
WORKDIR /home/gridvo-mosca
RUN ["npm","config","set","registry","http://registry.npm.taobao.org"]
RUN ["npm","install","--save","mongodb@2.2.25"]
RUN ["npm","install","--save","mosca@2.3.0"]
RUN ["npm","install","--save","underscore@1.8.3"]
RUN ["npm","install","--save","gridvo-common-js@0.0.23"]
COPY ./lib lib
VOLUME ["/home/gridvo-mosca"]
VOLUME ["/home/keys"]
ENTRYPOINT ["node"]
CMD ["app.js"]