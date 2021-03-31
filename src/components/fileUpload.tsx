import {
  Box,
  Button,
  Collapse,
  Heading,
  HStack,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spinner,
  Stack,
  Text,
  useClipboard,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import React, { ChangeEvent } from "react";
import { CirclePicker } from "react-color";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import { Image, Layer, Line, Stage } from "react-konva";
import GlobalContext from "../context/globalContext";
import ProtonAbi from "../contracts/Proton.json";
import SignPostAbi from "../contracts/rinkebySignpost.json";
import { formatAddress } from "../helpers/helpers";
import { GLOBALS } from "../helpers/globals";

type NftAttribute = {
  name: string;
  value: string;
};

type SignatureData = {
  address: string;
  message: string;
  signature: string;
};
type NftMetadata = {
  description?: string;
  external_url?: string;
  animation_url?: string;
  youtube_url?: string;
  icon?: string;
  image: string;
  thumbnail: string;
  name: string;
  symbol?: string;
  decimals?: number;
  background_color?: string;
  attributes?: NftAttribute[];
  creatorAnnuity?: number;
  particleType?: string;
  timestamp?: number;
  signatures: SignatureData[];
};

const STAGE_DIMENSION = 300;

const FileUploader = () => {
  const { state } = React.useContext(GlobalContext);
  const [photo, setPhoto] = React.useState<any>();
  const toast = useToast();
  const [autographedImage, setAutographedImage] = React.useState<any>();
  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState<any>([]);
  const isDrawing = React.useRef(false);
  const stageRef = React.useRef(null);
  const [imageSize, setImageSize] = React.useState({
    width: 300,
    height: 300,
  });
  const [color, setColor] = React.useState("#df4b26");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [txn, setTxn] = React.useState<any>();
  const [txnConfirmation, setConfirmation] = React.useState(false);
  const [autographHash, setHash] = React.useState("");
  const [metadata, setMetadata] = React.useState<NftMetadata>({
    name: "",
    image: "",
    thumbnail: "",
    signatures: [],
    description: "",
  });
  const { onCopy } = useClipboard(autographHash);

  React.useEffect(() => {
    if (photo && photo.width) {
      let aspectRatio = photo.width / photo.height;
      let newSize = { width: 0, height: 0 };

      if (aspectRatio >= 1) {
        newSize.width = STAGE_DIMENSION;
        newSize.height = STAGE_DIMENSION / aspectRatio;
      } else {
        newSize.width = STAGE_DIMENSION * aspectRatio;
        newSize.height = STAGE_DIMENSION;
      }
      setImageSize(newSize);
    }
  }, [photo]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    //@ts-ignore
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    let lastLine = lines[lines.length - 1];

    //@ts-ignore
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleFileClick = () => {
    var fileInputEl = document.createElement("input");
    fileInputEl.type = "file";
    fileInputEl.accept = "image/*";
    fileInputEl.style.display = "none";
    document.body.appendChild(fileInputEl);
    fileInputEl.addEventListener("input", function (e) {
      handleUpload(e as any);
      document.body.removeChild(fileInputEl);
    });
    fileInputEl.click();
  };

  const handleIPFSGrab = async () => {
    try {
      let metadata = await (
        await fetch(`https://ipfs.io/ipfs/${autographHash}`)
      ).json();
      setMetadata(metadata);
      let image = await (await fetch(metadata.image)).blob();
      let reader = new FileReader();
      reader.onload = function () {
        if (typeof reader.result === "string") {
          let img = new window.Image();
          img.src = reader.result;
          img.onload = function () {
            setPhoto(img);
            setAutographedImage(reader.result);
            onOpen();
          };
        }
      };
      reader.readAsDataURL(new File([image], "autograph.png"));
    } catch (err) {
      console.log(err);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: err.toString(),
        duration: 5000,
      });
    }
  };

  const handleUpload = async (evt: ChangeEvent<HTMLInputElement>) => {
    let files = evt.target.files;
    let reader = new FileReader();
    if (files && files.length > 0) {
      reader.onload = function () {
        let img = new window.Image();
        //@ts-ignore
        img.src = reader.result;
        img.onload = function () {
          setPhoto(img);
          onOpen();
        };
      };
      reader.readAsDataURL(files[0]);
    }
  };

  function dataURItoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(",")[1]);

    // separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
  }

  const autographPhoto = async () => {
    //@ts-ignore
    let img = stageRef.current!.toDataURL();
    setAutographedImage(img);
    setPhoto(undefined);
    setLines([]);
    onClose();
    try {
      let blob = dataURItoBlob(img);
      if (state.ipfs) {
        let added = await state.ipfs.add(blob, {});
        let nftMetadata = metadata;
        if (metadata.image === "") {
          let initialMetadata = {
            description: metadata.description,
            image: `https://ipfs.io/ipfs/${added.path}`,
            thumbnail: `https://ipfs.io/ipfs/${added.path}`,
            name: metadata.description,
            symbol: "PROTON",
            decimals: 18,
            background_color: "FFF",
            attributes: [
              { name: "Medium", value: "Digital photograph and digital ink" },
              {
                name: "Dimensions",
                value: `${imageSize.width} px x ${imageSize.height} px`,
              },
              { name: "Proof of Ownership", value: "Transaction Hash" },
              { name: "Edition", value: "1 of 1" },
            ],
            creatorAnnuity: 5,
            particleType: "proton",
            signatures: [] as SignatureData[],
          };
          setMetadata(initialMetadata as NftMetadata);
          nftMetadata = Object.assign(initialMetadata);
        } else {
          nftMetadata = {
            ...nftMetadata,
            image: `https://ipfs.io/ipfs/${added.path}`,
            thumbnail: `https://ipfs.io/ipfs/${added.path}`,
          };
        }

        let signer = await state.web3!.getSigner();
        const message = `I autographed this message at ${Date.now()}`;
        let signature = await signer.signMessage(message);
        nftMetadata.signatures.push({
          address: await signer.getAddress(),
          message: message,
          signature: signature,
        });
        console.log(nftMetadata);
        added = await state.ipfs.add(JSON.stringify(nftMetadata), {});
        console.log("ipfs hash", added.path);
        setHash(added.path);
      }
    } catch (error) {
      console.error(error);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: error.toString(),
        duration: 5000,
      });
    }
  };

  const mintNft = async () => {
    try {
      let signer = await state.web3!.getSigner();
      let tokenUri = `https://gateway.ipfs.io/ipfs/${autographHash}`;
      let signerAddress = await signer.getAddress();
      if (state.chain === 42 || state.chain === 1) {
        const protonContract = new ethers.Contract(
          GLOBALS.CHAINS[state.chain].contractAddress,
          ProtonAbi,
          signer
        );
        const res = await protonContract.functions.createProton(
          signerAddress,
          signerAddress,
          tokenUri,
          5
        );
        setTxn(res);
        console.log(res);
        res.wait().then((res: any) => setConfirmation(true));
      } else if (state.chain === 4) {
        const rinkebyContract = new ethers.Contract(
          GLOBALS.CHAINS[state.chain].contractAddress,
          SignPostAbi,
          signer
        );
        const res = await rinkebyContract.functions.mintNFT(
          signerAddress,
          tokenUri
        );
        setTxn(res);
        console.log(res);
        res.wait().then((res: any) => setConfirmation(true));
      } else
        toast({
          position: "top",
          status: "error",
          title: "Wrong Network",
          description: "Your wallet is connected to an unsupported network",
          duration: 5000,
        });
    } catch (error) {
      console.error(error);
      toast({
        position: "top",
        status: "error",
        title: "Something went wrong",
        description: error.toString(),
        duration: 5000,
      });
    }
    setPhoto(undefined);
  };

  const handleColorChange = (color: any) => {
    setColor(color.hex);
  };

  const handleHashCopy = () => {
    onCopy();
    toast({
      position: "top",
      status: "success",
      title: "IPFS hash copied",
      description: `Share ${formatAddress(autographHash)} with a friend`,
      duration: 5000,
    });
  };

  const renderMarketLink = () => {
    if (state.chain === 4) {
      return (
        <HStack
          onClick={() =>
            window.open(
              `https://testnets.opensea.io/accounts/${state.address}`,
              "_blank"
            )
          }
          cursor="pointer"
        >
          <Text>View on OpenSea</Text>
          <FiExternalLink />
        </HStack>
      );
    } else if (state.chain === 42) {
      return (
        <HStack
          onClick={() =>
            window.open(
              `https://staging.charged.fi/go/profile/${state.address}`,
              "_blank"
            )
          }
          cursor="pointer"
        >
          <Text>View on Charged Particles</Text>
          <FiExternalLink />
        </HStack>
      );
    } else if (state.chain === 1) {
      return (
        <HStack
          onClick={() =>
            window.open(
              `https://app.charged.fi/go/profile/${state.address}`,
              "_blank"
            )
          }
          cursor="pointer"
        >
          <Text>View on Charged Particles</Text>
          <FiExternalLink />
        </HStack>
      );
    }
  };

  const _renderEtherscanLink = () => {
    let name = ''

    switch (state.chain) {
      case 1: name = ''; break;
      case 4: name = 'rinkeby.'; break;
      case 42: name = 'kovan.'; break;
    }
    return (
      <HStack
        onClick={() =>
          window.open(
            `https://${name}etherscan.io/tx/${
              txn.hash
            }`,
            "_blank"
          )
        }
        cursor="pointer"
      >
        <Text color="green">Confirmed!</Text>
        <FiExternalLink />
      </HStack>
    );
  };

  return (
    <Box>
      <Stack align="center">
        <VStack>
          <Button w="250px" onClick={handleFileClick}>
            Select Image from Device
          </Button>
          {!autographHash ? (
            <Input
              w="250px"
              placeholder="IPFS Autograph Hash"
              value={autographHash}
              onChange={(evt) => setHash(evt.target.value)}
            />
          ) : (
            <HStack onClick={handleHashCopy} cursor="pointer">
              <Text>{formatAddress(autographHash)}</Text>
              <FiCopy />
            </HStack>
          )}
          <Button w="250px" onClick={handleIPFSGrab}>
            Load Autograph from IPFS
          </Button>
          <Collapse in={isOpen} animateOpacity>
            <VStack>
              <Heading size="sm">Sign Below</Heading>
              <Stage
                width={imageSize.width}
                height={imageSize.height}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                ref={stageRef}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                <Layer>
                  <Image
                    image={photo}
                    width={imageSize.width}
                    height={imageSize.height}
                  />
                </Layer>
                <Layer>
                  {lines.map((line: any, i: any) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={color}
                      strokeWidth={5}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation={
                        line.tool === "eraser"
                          ? "destination-out"
                          : "source-over"
                      }
                    />
                  ))}
                </Layer>
              </Stage>
              <Input
                value={metadata.name}
                placeholder="Name this NFT"
                onChange={(evt) =>
                  setMetadata({ ...metadata, name: evt.target.value })
                }
              />
              <Input
                value={metadata.description}
                placeholder="Describe this NFT"
                onChange={(evt) =>
                  setMetadata({ ...metadata, description: evt.target.value })
                }
              />
              <HStack>
                <Popover>
                  <PopoverTrigger>
                    <Button>Change Autograph Color</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader>Pick Color</PopoverHeader>
                    <PopoverBody>
                      <CirclePicker onChangeComplete={handleColorChange} />
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <Button onClick={() => setLines([])}>Clear Autograph</Button>
              </HStack>
              <Button onClick={autographPhoto} disabled={!state.web3}>Autograph NFT</Button>
              {metadata.signatures.length > 0 &&
                metadata.signatures.map((signature) => {
                  return (
                    <HStack key={signature.signature}>
                      <Text key={signature.message}>
                        Verified Signatures{" "}
                        {formatAddress(
                          ethers.utils.verifyMessage(
                            signature.message,
                            signature.signature
                          )
                        )}
                      </Text>
                    </HStack>
                  );
                })}
            </VStack>
          </Collapse>
          <Button
            w="250px"
            isDisabled={!autographedImage || !state.address}
            onClick={mintNft}
          >
            {`Mint on ${state.chain === 4 ? "Rinkeby" : "Charged Particles"}`}
          </Button>
          {txn && (
            <VStack>
              <HStack>
                <Text>{formatAddress(txn.hash)}</Text>
                {!txnConfirmation ? <Spinner /> : _renderEtherscanLink()}
              </HStack>
              {renderMarketLink()}
            </VStack>
          )}
        </VStack>
      </Stack>
    </Box>
  );
};

export default FileUploader;
