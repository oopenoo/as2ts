#coding:utf8
#上传目录到指定FTP服务器
import sys
import time
import socket
import os
import fcommon as comm
import shutil
import json
import string

class Foo:
	def __init__(self):
		pass

	def save_file(self, fpath, content):
		path = os.path.dirname(fpath)
		if not os.path.exists(path):
			os.makedirs(path)

		file = open(fpath, 'w+')
		file.write(content)
		file.close()
		# print("type(lines)=", type(lines))
		comm.println ("py>Save file:%s"%fpath)

	def load_file(self, fpath):
		file = open(fpath,'r')
		content = file.read()
		file.close()
		return content

	def move_file(self,srcfile,dstpath,fname):
		if not os.path.exists(dstpath):
			os.makedirs(dstpath)
		dstfile = os.path.join(dstpath, fname)
		shutil.copyfile(srcfile, dstfile)
		comm.println ("py> %s => %s"%(srcfile, dstfile ))

	def extract(self, srcdir, dstdir):
		if not os.path.isdir(dstdir):
			os.mkdir(dstdir)
			comm.println ("py>make folder:%s"%dstdir)

		filelist = comm.FilesTool(".as").dir_files(srcdir)
		
		ret = []
		for v in filelist:
			name = v['filename']
			fpath = v['fullname']
			# newname = string.join( v['head'], '#') + name
			newname = v['head']
			newname = newname.replace('\\', '#')
			if len(newname) > 0:
				newname = newname + "#" + name
			else:
				newname = name

			dstfile = os.path.join(dstdir, newname)
			comm.println ("py>:%s =>\n %s"%(fpath, dstfile) )
			shutil.copyfile(fpath, dstfile)

			fpath = os.path.join(v['head'])
			ret.append(dict(fpath=fpath, tsfile=name, destfile=newname))
		
		text = json.dumps(ret)
		indexfile = os.path.join(dstdir, "_index.json")
		self.save_file(indexfile, text)
		pass

	def movedir(self, srcdir, indexfile):
		text = self.load_file(indexfile)
		# comm.println ("py> type => %s"%( type(text) ))
		dstdir = "moved"
		ret = json.loads(text)
		for v in ret:
			sname = v['destfile']
			fname = v['tsfile']
			if fname.endswith('.as'):
				fname = fname[:-2]+"ts"

			if sname.endswith('.as'):
				sname = sname[:-2]+"ts"

			srcfile = os.path.join(srcdir, sname)
			dstpath = os.path.join(dstdir, v['fpath'])
			self.move_file(srcfile, dstpath, fname)
			# comm.println ("py> %s => %s"%(v['fpath'], fname))
		pass

def main():
	opt = sys.argv[1]
	srcdir = sys.argv[2]
	dstdir = sys.argv[3]

	comm.println ("py>Source folder:%s"%srcdir)
	comm.println ("py>Dest folder:%s"%dstdir)
	if opt == "extract":
		Foo().extract(srcdir, dstdir)
	else:
		Foo().movedir(srcdir, dstdir)
	
main()




