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
import { OSSService, Config } from '@yuntools/ali-oss'

const ossConfig: Config = {
  endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
  accessKeyId: 'foo',
  accessKeySecret: 'bar',
}
const ossService = new OSSService(ossConfig)

// 创建目录
const mkRet = await ossService.mkdir('oss://bucketfoo/barz')
assert(! mkRet.exitCode, `mkdir ${dir} failed, ${mkRet.stderr}`)


// 上传本地文件
const src = 'tsconfig.json'
const dst = `oss://bucketfoo/tsconfig.json`
const ret = await service.cp(src, dst)
assert(! ret.exitCode, `cp ${src} ${dst} failed, ${ret.stderr}`)
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

- cp()
- createSymlink()
- mkdir()
- mv()
- pathExists()
- probeUpload()
- rm()
- rmrf()
- stat()


## License
[MIT](LICENSE)

