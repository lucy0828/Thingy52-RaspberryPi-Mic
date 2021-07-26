#! /bin/bash

for i in *.pcm;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -f s16le -ar 16000 -ac 1 -i "$i" "${name}.wav"
done
