# actions-download-file
An action used to filter out a URL and download files for further works.

## Usage

### With `auto-match: true`

With `auto-match: true` it searches for the first URL wrapped in `()` brackets.

For example, you can let it pick the first `[]()` format URL from Markdown:

``` yaml
- uses: suisei-cn/actions-download-file@v1.4.0
  id: downloadfile  # Remember to give an ID if you need the output
  name: Download the file
  with:
    url: "The vendor we are using is [this](https://cdn.jsdelivr.net/npm/workbox-sw@5.1.3/build/workbox-sw.min.js)!"
    target: public/
    auto-match: true
    retry-times: 3
```

Finding the first `[]()` format URL from a comment event is also working, which is the primary aim of this action:

``` yaml
- uses: suisei-cn/actions-download-file@v1.4.0
  id: downloadfile  # Remember to give an ID if you need the output
  name: Download the file
  with:
    url: ${{ github.event.comment.body }}
    target: public/
    auto-match: true
```

### Without `auto-match`

With `auto-match: false` (which is the default behavior), you can directly give it an URL:

``` yaml
- uses: suisei-cn/actions-download-file@v1.3.0
  id: downloadfile  # Remember to give an ID if you need the output filename
  name: Download the file
  with:
    url: "https://cdn.jsdelivr.net/npm/workbox-sw@5.1.3/build/workbox-sw.min.js"
    target: public/
```

Note that you can achieve the same goal on Linux/macOS with simply one command, if you don't need the output:

``` yaml
- name: Download a file
  run: curl https://path/to/file -o path/to/save
```

``` yaml
- name: Download a file
  run: wget https://path/to/file -O path/to/save
```

## Input parameters
* url: The URL, or the Markdown text containing an URL
* target: The target directory where the downloaded file lies. Will be automatically created if not exists.
* auto-match: (optional, default `false`) If we find the URL from the text, or use the `url` parameter directly as the URL.
* filename: (optional) The filename to use when saving. If not given, use the original filename from the URL.
* retry-times: (optional, default `0`) Times to retry on download failure. If not given, don't attempt to retry.

## Output
* filename: The written file name.

## How `auto-match` works?
It attempts to find the first URL with the format `(url)`, such as `(https://g.co)`, which is the common way to embed a link into Markdown.

## Will it fail?
This action WILL fail if it cannot finish its job, including but not limited to the cases when:

* No URL is provided
* The file cannot be downloaded
* It cannot find an URL with the format `(url)`

## Examples
* <https://github.com/suisei-cn/sbtn-assets/blob/master/.github/workflows/auto_pr.yml>

## License
MIT
