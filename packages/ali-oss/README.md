# ali-oss

阿里云 OSS 命令行工具 ossutil 封装，支持 ESM，CJS 导入，提供 TypeScript 类型定义


## 安装

```sh
npm i @yuntools/ali-oss
```

## 安装命令行工具

### Linux 

[下载页面](https://help.aliyun.com/document_detail/120075.html)

```sh
sudo wget https://gosspublic.alicdn.com/ossutil/1.7.11/ossutil64 -O /usr/bin/ossutil
sudo chmod a+x /usr/bin/ossutil
```

## 使用

### Typescript 工程

```ts 
// foo.ts
import assert from 'node:assert'
import { OssClient, Config } from '@yuntools/ali-oss'

const ossConfig: Config = {
  endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
  accessKeyId: 'foo',
  accessKeySecret: 'bar',
}
const client = new OssClient(ossConfig)

const bucket = 'my-bucket'

// 创建目录
const target = 'foo/barz'
const opts: UploadOptions = {
  bucket,
  target,
}
const mkRet = await client.mkdir(opts)
assert(! mkRet.exitCode, `mkdir ${opts.target} failed, ${mkRet.stderr}`)


// 上传本地文件
const src = 'tsconfig.json'
const target = `foo/tsconfig.json`
const opts: UploadOptions = {
  bucket,
  src,
  target,
}
const ret = await service.upload(opts)
assert(! ret.exitCode, `upload ${src} ${dst} failed, ${ret.stderr}`)
assert(ret.data)
```

### CLI 命令行

安装执行环境
```sh
cd example
npm i
```

执行脚本
```sh
cd example

# zx 执行器
./zx-import.mjs
./zx-require.mjs

# ts-node 执行器
./ts-node-import.ts
```

### OSS 操作实例方法

- `cp()` 在远程拷贝
- `createSymlink()` 创建软连接
- `mkdir()` 创建目录
- `mv()` 在远程移动对象
- `pathExists()` 检测远程文件是否存在
- `rm()` 删除远程对象
- `rmrf()` 删除远程对象及其下级所有对象
- `stat()` 获取远程对象属性
- `syncLocal2Cloud()` （强制）同步本地目录到远程
- `upload()` 上传本地文件到远程

## License
[MIT](LICENSE)

